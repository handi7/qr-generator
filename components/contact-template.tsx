"use client";

import { ButtonProps, Input } from "@heroui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import Icon from "./Shared/Icon";
import Button from "./Shared/Button";

interface ContactState {
  fullName?: string;
  company?: string;
  jobTitle?: string;
  department?: string;
  phones: string[];
  emails: string[];
  websites: string[];
  address?: string;
}

const defaultState: ContactState = {
  fullName: "",
  company: "",
  jobTitle: "",
  department: "",
  phones: [""],
  emails: [""],
  websites: [""],
  address: "",
};

function ContactTemplate() {
  const pathname = usePathname();
  const router = useRouter();
  const sp = useSearchParams();
  const searchParams = new URLSearchParams(sp);

  const text = searchParams.get("text") || "";

  const [data, setData] = useState<ContactState>(defaultState);

  const setQuery = (next: ContactState) => {
    const params = new URLSearchParams(searchParams);
    const fullName = next.fullName?.trim() || "";
    const company = next.company?.trim() || "";
    const jobTitle = next.jobTitle?.trim() || "";
    const department = next.department?.trim() || "";
    const address = next.address?.trim() || "";
    const phones = next.phones.map((value) => value.trim()).filter(Boolean);
    const emails = next.emails.map((value) => value.trim()).filter(Boolean);
    const websites = next.websites.map((value) => value.trim()).filter(Boolean);

    setOrDelete(params, "full_name", fullName);
    setOrDelete(params, "company", company);
    setOrDelete(params, "job_title", jobTitle);
    setOrDelete(params, "department", department);
    setOrDelete(params, "address", address);

    params.delete("phone");
    phones.forEach((phone) => params.append("phone", phone));

    params.delete("email");
    emails.forEach((email) => params.append("email", email));

    params.delete("website");
    websites.forEach((website) => params.append("website", website));

    const formatted = formatContactVCard({
      fullName,
      company,
      jobTitle,
      department,
      phones,
      emails,
      websites,
      address,
    });

    if (formatted) params.set("text", formatted);
    else params.delete("text");

    router.replace(`${pathname}?${params.toString()}`);
  };

  const debounce = useDebouncedCallback(setQuery, 500);

  const onFieldChange = (
    key: "fullName" | "company" | "jobTitle" | "department" | "address",
    value: string,
  ) => {
    setData((prev) => {
      const newVal = { ...prev, [key]: value };
      debounce(newVal);

      return newVal;
    });
  };

  const onListChange = (key: "phones" | "emails" | "websites", index: number, value: string) => {
    setData((prev) => {
      const nextList = [...prev[key]];
      nextList[index] = value;
      const newVal = { ...prev, [key]: nextList };
      debounce(newVal);

      return newVal;
    });
  };

  const addListField = (key: "phones" | "emails" | "websites") => {
    setData((prev) => {
      const newVal = { ...prev, [key]: [...prev[key], ""] };
      debounce(newVal);

      return newVal;
    });
  };

  const removeListField = (key: "phones" | "emails" | "websites", index: number) => {
    setData((prev) => {
      if (prev[key].length <= 1) return prev;

      const nextList = prev[key].filter((_, i) => i !== index);
      const newVal = { ...prev, [key]: nextList.length ? nextList : [""] };
      debounce(newVal);

      return newVal;
    });
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFieldChange(name as "fullName" | "company" | "jobTitle" | "department" | "address", value);
  };

  useEffect(() => {
    const parsed = parseContactQuery(searchParams) || parseContactVCard(text);
    if (parsed) setData(parsed);
  }, []);

  return (
    <div className="flex flex-col gap-3 max-w-md">
      <Input
        variant="bordered"
        isRequired
        label="Full Name"
        name="fullName"
        placeholder="John Doe"
        value={data.fullName}
        onChange={onInputChange}
        isInvalid={!data.fullName?.trim()}
        errorMessage="Full Name is required"
      />

      <Input
        variant="bordered"
        label="Company"
        name="company"
        placeholder="Company"
        value={data.company}
        onChange={onInputChange}
      />

      <Input
        variant="bordered"
        label="Job Title"
        name="jobTitle"
        placeholder="Software Engineer"
        value={data.jobTitle}
        onChange={onInputChange}
      />

      <Input
        variant="bordered"
        label="Department"
        name="department"
        placeholder="Engineering"
        value={data.department}
        onChange={onInputChange}
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm">Phone Numbers</label>
        {data.phones.map((phone, index) => (
          <div key={`phone-${index}`} className="flex items-center gap-2">
            <Input
              variant="bordered"
              label={`Phone ${index + 1}`}
              placeholder="+12345678"
              endContent={
                <Trash
                  isDisabled={data.phones.length <= 1}
                  onPress={() => removeListField("phones", index)}
                />
              }
              value={phone}
              onChange={(e) => onListChange("phones", index, e.target.value)}
            />
          </div>
        ))}
        <Button size="sm" variant="flat" onPress={() => addListField("phones")}>
          Add Phone
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm">Emails</label>
        {data.emails.map((email, index) => (
          <div key={`email-${index}`} className="flex items-center gap-2">
            <Input
              variant="bordered"
              type="email"
              label={`Email ${index + 1}`}
              placeholder="john@email.com"
              endContent={
                <Trash
                  isDisabled={data.emails.length <= 1}
                  onPress={() => removeListField("emails", index)}
                />
              }
              value={email}
              onChange={(e) => onListChange("emails", index, e.target.value)}
            />
          </div>
        ))}
        <Button size="sm" variant="flat" onPress={() => addListField("emails")}>
          Add Email
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm">Websites</label>
        {data.websites.map((website, index) => (
          <div key={`website-${index}`} className="flex items-center gap-2">
            <Input
              variant="bordered"
              label={`Website ${index + 1}`}
              placeholder="https://example.com"
              endContent={
                <Trash
                  isDisabled={data.websites.length <= 1}
                  onPress={() => removeListField("websites", index)}
                />
              }
              value={website}
              onChange={(e) => onListChange("websites", index, e.target.value)}
            />
          </div>
        ))}
        <Button size="sm" variant="flat" onPress={() => addListField("websites")}>
          Add Website
        </Button>
      </div>

      <Input
        variant="bordered"
        label="Address"
        name="address"
        placeholder="Street, City"
        value={data.address}
        onChange={onInputChange}
      />
    </div>
  );
}

function Trash(props: ButtonProps) {
  return (
    <Button isIconOnly size="sm" color="danger" {...props}>
      <Icon name="trash-2" />
    </Button>
  );
}

function setOrDelete(params: URLSearchParams, key: string, value: string) {
  if (value) params.set(key, value);
  else params.delete(key);
}

function escapeVCardValue(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r/g, "")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function unescapeVCardValue(value: string) {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function ensureList(values: string[]) {
  return values.length ? values : [""];
}

function parseContactQuery(searchParams: URLSearchParams): ContactState | null {
  const fullName = searchParams.get("full_name") || "";
  const company = searchParams.get("company") || "";
  const jobTitle = searchParams.get("job_title") || "";
  const department = searchParams.get("department") || "";
  const address = searchParams.get("address") || "";

  const phones = searchParams
    .getAll("phone")
    .map((value) => value.trim())
    .filter(Boolean);
  const emails = searchParams
    .getAll("email")
    .map((value) => value.trim())
    .filter(Boolean);
  const websites = searchParams
    .getAll("website")
    .map((value) => value.trim())
    .filter(Boolean);

  const hasQueryData =
    !!fullName ||
    !!company ||
    !!jobTitle ||
    !!department ||
    !!address ||
    phones.length > 0 ||
    emails.length > 0 ||
    websites.length > 0;

  if (!hasQueryData) return null;

  return {
    fullName,
    company,
    jobTitle,
    department,
    phones: ensureList(phones),
    emails: ensureList(emails),
    websites: ensureList(websites),
    address,
  };
}

function parseContactVCard(qrString: string): ContactState | null {
  if (!qrString.includes("BEGIN:VCARD") || !qrString.includes("END:VCARD")) return null;

  const state: ContactState = { ...defaultState, phones: [], emails: [], websites: [] };
  const lines = qrString.split(/\r?\n/).map((line) => line.trim());

  for (const line of lines) {
    if (line.startsWith("FN:")) {
      state.fullName = unescapeVCardValue(line.slice(3));
      continue;
    }

    if (line.startsWith("ORG:")) {
      const orgParts = line.slice(4).split(/(?<!\\);/);
      state.company = unescapeVCardValue(orgParts[0] || "");
      state.department = unescapeVCardValue(orgParts[1] || "");
      continue;
    }

    if (line.startsWith("TITLE:")) {
      state.jobTitle = unescapeVCardValue(line.slice(6));
      continue;
    }

    const telMatch = line.match(/^TEL(?:;[^:]*)?:(.*)$/);
    if (telMatch) {
      state.phones.push(unescapeVCardValue(telMatch[1]));
      continue;
    }

    const emailMatch = line.match(/^EMAIL(?:;[^:]*)?:(.*)$/);
    if (emailMatch) {
      state.emails.push(unescapeVCardValue(emailMatch[1]));
      continue;
    }

    const urlMatch = line.match(/^URL(?:;[^:]*)?:(.*)$/);
    if (urlMatch) {
      state.websites.push(unescapeVCardValue(urlMatch[1]));
      continue;
    }

    if (line.startsWith("ADR:")) {
      const adrParts = line.slice(4).split(/(?<!\\);/);
      state.address = unescapeVCardValue(adrParts[2] || "");
    }
  }

  if (!state.fullName) return null;

  state.phones = ensureList(state.phones.map((value) => value.trim()).filter(Boolean));
  state.emails = ensureList(state.emails.map((value) => value.trim()).filter(Boolean));
  state.websites = ensureList(state.websites.map((value) => value.trim()).filter(Boolean));

  return state;
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

function formatContactVCard(data: ContactState): string {
  const fullName = data.fullName?.trim() || "";
  if (!fullName) return "";

  const company = data.company?.trim();
  const jobTitle = data.jobTitle?.trim();
  const department = data.department?.trim();
  const phones = data.phones.map((value) => value.trim()).filter(Boolean);
  const emails = data.emails.map((value) => value.trim()).filter(Boolean);
  const websites = data.websites.map((value) => value.trim()).filter(Boolean);
  const address = data.address?.trim();

  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${escapeVCardValue(fullName)}`];

  const structuredName = toStructuredName(fullName);
  if (structuredName) {
    lines.push(
      `N:${escapeVCardValue(structuredName.lastName)};${escapeVCardValue(structuredName.firstName)};;;`,
    );
  }

  if (company || department) {
    if (company && department)
      lines.push(`ORG:${escapeVCardValue(company)};${escapeVCardValue(department)}`);
    else if (company) lines.push(`ORG:${escapeVCardValue(company)}`);
    else lines.push(`ORG:;${escapeVCardValue(department || "")}`);
  }

  if (jobTitle) lines.push(`TITLE:${escapeVCardValue(jobTitle)}`);

  phones.forEach((phone, index) => {
    lines.push(`TEL;TYPE=${index === 0 ? "CELL" : "WORK"}:${escapeVCardValue(phone)}`);
  });

  emails.forEach((email) => {
    lines.push(`EMAIL:${escapeVCardValue(email)}`);
  });

  websites.forEach((website) => {
    lines.push(`URL:${escapeVCardValue(website)}`);
  });

  if (address) lines.push(`ADR:;;${escapeVCardValue(address)};;;;`);

  lines.push("END:VCARD");

  return lines.join("\n");
}

export default ContactTemplate;
