"use client";

import { ButtonProps, Input } from "@heroui/react";
import React from "react";

import Button from "./Shared/Button";
import Icon from "./Shared/Icon";

import usePayloadForm from "@/hokks/usePayloadForm";
import contactCodec from "@/utils/payloads/contact";

type ListField = "phones" | "emails" | "websites";

function ContactTemplate() {
  const { data, patch, set } = usePayloadForm(contactCodec);

  const onListChange = (key: ListField, index: number, value: string) => {
    set((prev) => {
      const nextList = [...prev[key]];

      nextList[index] = value;

      return { ...prev, [key]: nextList };
    });
  };

  const addListField = (key: ListField) => {
    set((prev) => ({ ...prev, [key]: [...prev[key], ""] }));
  };

  const removeListField = (key: ListField, index: number) => {
    set((prev) => {
      if (prev[key].length <= 1) return prev;

      const nextList = prev[key].filter((_, i) => i !== index);

      return { ...prev, [key]: nextList.length ? nextList : [""] };
    });
  };

  return (
    <div className="flex flex-col gap-3 max-w-md">
      <Input
        variant="bordered"
        isRequired
        label="Full Name"
        name="fullName"
        placeholder="John Doe"
        value={data.fullName}
        onChange={(e) => patch({ fullName: e.target.value })}
        isInvalid={!data.fullName.trim()}
        errorMessage="Full Name is required"
      />

      <Input
        variant="bordered"
        label="Company"
        name="company"
        placeholder="Company"
        value={data.company}
        onChange={(e) => patch({ company: e.target.value })}
      />

      <Input
        variant="bordered"
        label="Job Title"
        name="jobTitle"
        placeholder="Software Engineer"
        value={data.jobTitle}
        onChange={(e) => patch({ jobTitle: e.target.value })}
      />

      <Input
        variant="bordered"
        label="Department"
        name="department"
        placeholder="Engineering"
        value={data.department}
        onChange={(e) => patch({ department: e.target.value })}
      />

      <ListSection
        id="contact-phones-label"
        label="Phone Numbers"
        addLabel="Add Phone"
        onAdd={() => addListField("phones")}
      >
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
      </ListSection>

      <ListSection
        id="contact-emails-label"
        label="Emails"
        addLabel="Add Email"
        onAdd={() => addListField("emails")}
      >
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
      </ListSection>

      <ListSection
        id="contact-websites-label"
        label="Websites"
        addLabel="Add Website"
        onAdd={() => addListField("websites")}
      >
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
      </ListSection>

      <Input
        variant="bordered"
        label="Address"
        name="address"
        placeholder="Street, City"
        value={data.address}
        onChange={(e) => patch({ address: e.target.value })}
      />
    </div>
  );
}

interface ListSectionProps {
  /** A plain <label> can't name a set of inputs, so the group is labelled by id. */
  id: string;
  label: string;
  addLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
}

function ListSection({ id, label, addLabel, onAdd, children }: ListSectionProps) {
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-2">
      <span id={id} className="text-sm">
        {label}
      </span>

      {children}

      <Button size="sm" variant="flat" onPress={onAdd}>
        {addLabel}
      </Button>
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

export default ContactTemplate;
