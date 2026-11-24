import { z } from "zod";

import { UNITS, VAT_RATES } from "./data/types";

/**
 * Error messages are keys of `account.errors` in the dictionaries
 * (translated by the server action before being returned to the form).
 */
export type ErrorKey =
  | "required"
  | "name"
  | "email"
  | "phone"
  | "nif"
  | "passwordShort"
  | "passwordMismatch"
  | "consent"
  | "description"
  | "tooLong"
  | "generic";

/** Validates a Portuguese NIF (9 digits + check digit). */
export function isValidPortugueseNif(nif: string) {
  if (!/^\d{9}$/.test(nif)) return false;
  const digits = [...nif].map(Number);
  const sum = digits.slice(0, 8).reduce((total, digit, index) => total + digit * (9 - index), 0);
  const check = 11 - (sum % 11);
  return (check >= 10 ? 0 : check) === digits[8];
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, "tooLong")
    .transform((value) => value || null)
    .nullable()
    .optional()
    .transform((value) => value ?? null);

const name = z.string().trim().min(2, "name").max(120, "tooLong");
const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("email").max(254, "email"));
const phone = z
  .string()
  .trim()
  .regex(/^\+?[\d\s().-]{9,20}$/, "phone");
// Portuguese NIF is checked; foreign VAT numbers (e.g. "ES12345678Z") are accepted as typed.
const nif = optionalText(20).refine(
  (value) => {
    if (!value) return true;
    const compact = value.replace(/\s/g, "").toUpperCase().replace(/^PT/, "");
    if (/^\d+$/.test(compact)) return isValidPortugueseNif(compact);
    return /^[A-Z]{2}[A-Z0-9]{2,18}$/.test(compact);
  },
  { message: "nif" },
).transform((value) =>
  value ? value.replace(/\s/g, "").toUpperCase().replace(/^PT(?=\d{9}$)/, "") : value,
);
const password = z.string().min(8, "passwordShort").max(200, "tooLong");

const profileFields = {
  name,
  phone,
  client_type: optionalText(60),
  company: optionalText(120),
  nif,
  city: optionalText(120),
  address: optionalText(250),
};

export const registerSchema = z
  .object({
    ...profileFields,
    email,
    password,
    password_confirm: z.string(),
    consent: z.literal("on", { message: "consent" }),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "passwordMismatch",
    path: ["password_confirm"],
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "required").max(200, "tooLong"),
});

export const profileSchema = z.object(profileFields);

export const passwordChangeSchema = z
  .object({
    current_password: z.string().min(1, "required"),
    password,
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "passwordMismatch",
    path: ["password_confirm"],
  });

export const requestSchema = z.object({
  service: z.string().trim().min(1, "required").max(100, "tooLong"),
  location: optionalText(120),
  description: z.string().trim().min(10, "description").max(4000, "tooLong"),
});

// ---- Admin ----

export const adminClientSchema = z.object({
  ...profileFields,
  email,
  locale: z.enum(["pt", "en"]),
});

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable()
  .optional()
  .transform((value) => value || null);

export const quoteSchema = z.object({
  client_id: z.coerce.number().int().positive("required"),
  request_id: z.coerce
    .number()
    .int()
    .positive()
    .nullable()
    .optional()
    .transform((value) => value ?? null),
  title: z.string().trim().min(3, "required").max(160, "tooLong"),
  location: optionalText(160),
  notes: optionalText(4000),
  vat_rate: z.coerce.number().refine((rate) => (VAT_RATES as readonly number[]).includes(rate)),
  valid_until: isoDate,
  items: z
    .array(
      z.object({
        description: z.string().trim().min(1, "required").max(500, "tooLong"),
        quantity: z.number().positive().max(1_000_000),
        unit: z.enum(UNITS),
        unit_price_cents: z.number().int().min(0).max(100_000_000_00),
      }),
    )
    .min(1, "required")
    .max(200),
});

export const adminNameSchema = z.object({ name });

export const adminPasswordSchema = z
  .object({
    current_password: z.string().min(1, "required"),
    password: z.string().min(10, "adminPasswordShort").max(200, "tooLong"),
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "passwordMismatch",
    path: ["password_confirm"],
  });

export const workDatesSchema = z.object({
  start_date: isoDate,
  end_date: isoDate,
});

export const workUpdateSchema = z.object({
  message: z.string().trim().min(2, "required").max(4000, "tooLong"),
  visible: z
    .literal("on")
    .optional()
    .transform((value) => value === "on"),
});

/**
 * First error per field, translated with the given messages.
 * Pass formData to also report a password mismatch: zod skips cross-field
 * checks while other fields have errors, so it's checked here directly.
 */
export function fieldErrors(error: z.ZodError, messages: Record<string, string>, formData?: FormData) {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    result[field] ??= messages[issue.message] ?? messages.generic ?? issue.message;
  }
  if (
    formData?.has("password_confirm") &&
    !result.password_confirm &&
    formData.get("password") !== formData.get("password_confirm")
  ) {
    result.password_confirm = messages.passwordMismatch;
  }
  return result;
}

/**
 * Turns FormData into a plain object of strings, used to refill a form after a
 * validation error. Passwords and framework fields are never sent back.
 */
export function formValues(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$") && !key.includes("password")) {
      values[key] = value;
    }
  }
  return values;
}

export type FormState =
  | {
      ok?: boolean;
      message?: string;
      errors?: Record<string, string>;
      values?: Record<string, string>;
      /** Extra data returned to the form (e.g. a temporary password). */
      data?: Record<string, string>;
    }
  | undefined;
