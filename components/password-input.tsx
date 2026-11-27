"use client";

import { useState } from "react";

import { EyeIcon, EyeOffIcon } from "./icons";

/** Password field with a button to show/hide what is being typed. */
export function PasswordInput({
  id,
  name,
  required,
  autoComplete,
  invalid,
  describedBy,
  className,
  labels,
}: {
  id: string;
  name: string;
  required?: boolean;
  autoComplete?: string;
  invalid?: boolean;
  describedBy?: string;
  className: string;
  labels: { show: string; hide: string };
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative mt-1.5">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        required={required}
        autoComplete={autoComplete}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        className={`${className} pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? labels.hide : labels.show}
        aria-pressed={visible}
        aria-controls={id}
        title={visible ? labels.hide : labels.show}
        className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-lg text-slate-500 dark:text-slate-400 transition-colors hover:text-navy-900 dark:hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500"
      >
        {visible ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
      </button>
    </div>
  );
}
