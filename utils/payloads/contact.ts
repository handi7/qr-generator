import { PayloadCodec } from "@/types/payload.type";

export interface ContactState {
  fullName: string;
  company: string;
  jobTitle: string;
  department: string;
  phones: string[];
  emails: string[];
  websites: string[];
  address: string;
}

const empty: ContactState = {
  fullName: "",
  company: "",
  jobTitle: "",
  department: "",
  phones: [""],
  emails: [""],
  websites: [""],
  address: "",
};

function escapeValue(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r/g, "")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function unescapeValue(value: string) {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

/** The list inputs always render at least one row. */
function ensureList(values: string[]) {
  return values.length ? values : [""];
}

function clean(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}

function toStructuredName(fullName: string): { firstName: string; lastName: string } | null {
  const parts = fullName
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) return null;

  const lastName = parts[parts.length - 1];
  const firstName = parts.slice(0, -1).join(" ");

  if (!firstName || !lastName) return null;

  return { firstName, lastName };
}

const contactCodec: PayloadCodec<ContactState> = {
  key: "contact",
  empty,
  defaultText: "BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nEND:VCARD",

  detect(text) {
    return text.includes("BEGIN:VCARD") && text.includes("END:VCARD");
  },

  parse(text) {
    if (!text.includes("BEGIN:VCARD") || !text.includes("END:VCARD")) return null;

    const state: ContactState = { ...empty, phones: [], emails: [], websites: [] };
    const lines = text.split(/\r?\n/).map((line) => line.trim());

    for (const line of lines) {
      if (line.startsWith("FN:")) {
        state.fullName = unescapeValue(line.slice(3));
        continue;
      }

      if (line.startsWith("ORG:")) {
        const orgParts = line.slice(4).split(/(?<!\\);/);

        state.company = unescapeValue(orgParts[0] || "");
        state.department = unescapeValue(orgParts[1] || "");
        continue;
      }

      if (line.startsWith("TITLE:")) {
        state.jobTitle = unescapeValue(line.slice(6));
        continue;
      }

      const telMatch = line.match(/^TEL(?:;[^:]*)?:(.*)$/);

      if (telMatch) {
        state.phones.push(unescapeValue(telMatch[1]));
        continue;
      }

      const emailMatch = line.match(/^EMAIL(?:;[^:]*)?:(.*)$/);

      if (emailMatch) {
        state.emails.push(unescapeValue(emailMatch[1]));
        continue;
      }

      const urlMatch = line.match(/^URL(?:;[^:]*)?:(.*)$/);

      if (urlMatch) {
        state.websites.push(unescapeValue(urlMatch[1]));
        continue;
      }

      if (line.startsWith("ADR:")) {
        const adrParts = line.slice(4).split(/(?<!\\);/);

        state.address = unescapeValue(adrParts[2] || "");
      }
    }

    if (!state.fullName) return null;

    state.phones = ensureList(clean(state.phones));
    state.emails = ensureList(clean(state.emails));
    state.websites = ensureList(clean(state.websites));

    return state;
  },

  build(state) {
    const fullName = state.fullName.trim();

    if (!fullName) return "";

    const company = state.company.trim();
    const jobTitle = state.jobTitle.trim();
    const department = state.department.trim();
    const address = state.address.trim();
    const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${escapeValue(fullName)}`];
    const structuredName = toStructuredName(fullName);

    if (structuredName) {
      lines.push(
        `N:${escapeValue(structuredName.lastName)};${escapeValue(structuredName.firstName)};;;`,
      );
    }

    if (company || department) {
      if (company && department)
        lines.push(`ORG:${escapeValue(company)};${escapeValue(department)}`);
      else if (company) lines.push(`ORG:${escapeValue(company)}`);
      else lines.push(`ORG:;${escapeValue(department)}`);
    }

    if (jobTitle) lines.push(`TITLE:${escapeValue(jobTitle)}`);

    clean(state.phones).forEach((phone, index) => {
      lines.push(`TEL;TYPE=${index === 0 ? "CELL" : "WORK"}:${escapeValue(phone)}`);
    });

    clean(state.emails).forEach((email) => {
      lines.push(`EMAIL:${escapeValue(email)}`);
    });

    clean(state.websites).forEach((website) => {
      lines.push(`URL:${escapeValue(website)}`);
    });

    if (address) lines.push(`ADR:;;${escapeValue(address)};;;;`);

    lines.push("END:VCARD");

    return lines.join("\n");
  },

  // build() returns "" until there is a full name, so the fields are mirrored
  // into the URL to keep a half-filled form across a reload.
  paramKeys: [
    "full_name",
    "company",
    "job_title",
    "department",
    "address",
    "phone",
    "email",
    "website",
  ],

  toParams(state) {
    return {
      full_name: state.fullName.trim(),
      company: state.company.trim(),
      job_title: state.jobTitle.trim(),
      department: state.department.trim(),
      address: state.address.trim(),
      phone: clean(state.phones),
      email: clean(state.emails),
      website: clean(state.websites),
    };
  },

  fromParams(params) {
    const phones = clean(params.getAll("phone"));
    const emails = clean(params.getAll("email"));
    const websites = clean(params.getAll("website"));
    const state: ContactState = {
      fullName: params.get("full_name") ?? "",
      company: params.get("company") ?? "",
      jobTitle: params.get("job_title") ?? "",
      department: params.get("department") ?? "",
      address: params.get("address") ?? "",
      phones: ensureList(phones),
      emails: ensureList(emails),
      websites: ensureList(websites),
    };

    const hasData =
      !!state.fullName ||
      !!state.company ||
      !!state.jobTitle ||
      !!state.department ||
      !!state.address ||
      !!phones.length ||
      !!emails.length ||
      !!websites.length;

    return hasData ? state : null;
  },
};

export default contactCodec;
