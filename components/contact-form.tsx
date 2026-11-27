"use client";

import { useId, type FormEvent } from "react";

import { MailIcon, WhatsAppIcon } from "./icons";

type Labels = {
  title: string;
  subtitle: string;
  name: string;
  namePlaceholder: string;
  clientType: string;
  clientTypes: string[];
  service: string;
  otherService: string;
  location: string;
  locationPlaceholder: string;
  message: string;
  messagePlaceholder: string;
  select: string;
  required: string;
  submitWhatsapp: string;
  submitEmail: string;
  privacy: string;
  messageIntro: string;
  emailSubject: string;
};

type Props = {
  labels: Labels;
  services: string[];
  whatsappNumber: string;
  email: string;
};

const fieldClass =
  "mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-navy-900 shadow-xs transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none dark:border-white/15 dark:bg-navy-950 dark:text-white dark:placeholder:text-slate-500";

export function ContactForm({ labels, services, whatsappNumber, email }: Props) {
  const id = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const channel = submitter?.value === "email" ? "email" : "whatsapp";

    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? "").trim();

    const optional = (label: string, key: string) =>
      value(key) ? [`${label}: ${value(key)}`] : [];

    const text = [
      labels.messageIntro,
      "",
      `${labels.name}: ${value("name")}`,
      ...optional(labels.clientType, "clientType"),
      ...optional(labels.service, "service"),
      ...optional(labels.location, "location"),
      "",
      `${labels.message}:`,
      value("message"),
    ].join("\n");

    if (channel === "email") {
      const subject = `${labels.emailSubject} — ${value("name")}`;
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    } else {
      window.open(
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  }

  const requiredMark = (
    <span className="text-brand-700 dark:text-brand-400" aria-hidden="true">
      {" "}*
    </span>
  );

  return (
    <form
      onSubmit={handleSubmit}
      aria-labelledby={`${id}-title`}
      className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 p-6 shadow-xl shadow-navy-900/5 sm:p-10"
    >
      <h3 id={`${id}-title`} className="font-display text-2xl font-bold text-navy-900 dark:text-white">
        {labels.title}
      </h3>
      <p className="mt-2 text-slate-600 dark:text-slate-300">{labels.subtitle}</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-name`} className="text-sm font-semibold text-navy-900 dark:text-white">
            {labels.name}
            {requiredMark}
            <span className="sr-only"> ({labels.required})</span>
          </label>
          <input
            id={`${id}-name`}
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder={labels.namePlaceholder}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor={`${id}-clientType`} className="text-sm font-semibold text-navy-900 dark:text-white">
            {labels.clientType}
          </label>
          <select id={`${id}-clientType`} name="clientType" defaultValue="" className={fieldClass}>
            <option value="">{labels.select}</option>
            {labels.clientTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${id}-service`} className="text-sm font-semibold text-navy-900 dark:text-white">
            {labels.service}
          </label>
          <select id={`${id}-service`} name="service" defaultValue="" className={fieldClass}>
            <option value="">{labels.select}</option>
            {services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
            <option value={labels.otherService}>{labels.otherService}</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${id}-location`} className="text-sm font-semibold text-navy-900 dark:text-white">
            {labels.location}
          </label>
          <input
            id={`${id}-location`}
            name="location"
            type="text"
            autoComplete="address-level2"
            placeholder={labels.locationPlaceholder}
            className={fieldClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${id}-message`} className="text-sm font-semibold text-navy-900 dark:text-white">
            {labels.message}
            {requiredMark}
            <span className="sr-only"> ({labels.required})</span>
          </label>
          <textarea
            id={`${id}-message`}
            name="message"
            rows={5}
            required
            placeholder={labels.messagePlaceholder}
            className={`${fieldClass} resize-y`}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          name="channel"
          value="whatsapp"
          className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-lg bg-whatsapp px-6 py-3.5 font-semibold text-navy-950 shadow-lg shadow-whatsapp/25 transition-colors hover:bg-whatsapp-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900"
        >
          <WhatsAppIcon className="size-5" />
          {labels.submitWhatsapp}
        </button>
        <button
          type="submit"
          name="channel"
          value="email"
          className="inline-flex items-center justify-center gap-2.5 rounded-lg border border-slate-300 dark:border-white/15 px-6 py-3.5 font-semibold text-navy-900 dark:text-white transition-colors hover:border-navy-900 dark:hover:border-white/40 hover:bg-slate-50 dark:hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900"
        >
          <MailIcon className="size-5" />
          {labels.submitEmail}
        </button>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{labels.privacy}</p>
    </form>
  );
}
