"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { contactFields } from "@/content/site";

type FormValues = Record<(typeof contactFields)[number]["id"], string>;
type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: "",
  email: "",
  role: "",
  workflow: "",
  details: ""
};

export function ContactForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<string>("");

  const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    contactFields.forEach((field) => {
      const value = values[field.id].trim();
      if (field.required && !value) {
        nextErrors[field.id] = `${field.label} is required.`;
      }
    });

    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    return nextErrors;
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus("Fix the highlighted fields before requesting access.");
      return;
    }

    setErrors({});
    setStatus("Submission routing is not connected yet, so no data was sent. Your draft is still here.");
  };

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      {contactFields.map((field) => {
        const hasError = Boolean(errors[field.id]);
        const commonProps = {
          id: field.id,
          name: field.id,
          required: field.required,
          placeholder: field.placeholder,
          value: values[field.id],
          onChange
        };

        return (
          <label key={field.id} className={`contact-field${hasError ? " has-error" : ""}`} htmlFor={field.id}>
            <span>{field.label}</span>
            {field.type === "textarea" ? (
              <textarea {...commonProps} rows={5} />
            ) : (
              <input {...commonProps} type={field.type} />
            )}
            <small>{errors[field.id] ?? " "}</small>
          </label>
        );
      })}

      <div className="contact-form__actions">
        <button className="button" type="submit">
          Request early access
        </button>
        <p className="contact-form__status">{status || "Frontend-only for now. Nothing is transmitted yet."}</p>
      </div>

      <div className="contact-form__footnote">
        <p className="mini-label">Current v1 status</p>
        <p>
          This form validates locally, keeps your draft intact, and intentionally avoids network requests until Luxen
          wires a backend or external intake flow.
        </p>
      </div>
    </form>
  );
}
