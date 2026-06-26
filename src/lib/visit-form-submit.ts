import type { FieldValues, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import type { ZodType } from "zod";

import { applySchemaErrors } from "@/lib/form-errors";

interface ConfirmVisitSubmitOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  schema: ZodType;
  onValid: (data: T) => Promise<void>;
  onInvalid?: () => void;
  invalidMessage?: string;
}

export async function confirmVisitSubmit<T extends FieldValues>({
  form,
  schema,
  onValid,
  onInvalid,
  invalidMessage = "Please fix the date and time before saving",
}: ConfirmVisitSubmitOptions<T>): Promise<void> {
  const parsed = schema.safeParse(form.getValues());
  if (!parsed.success) {
    applySchemaErrors(form, parsed.error.issues);
    onInvalid?.();
    toast.error(invalidMessage);
    return;
  }
  await onValid(parsed.data as T);
}
