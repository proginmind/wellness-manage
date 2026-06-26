import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import type { ZodIssue } from "zod";

export function applySchemaErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  issues: ZodIssue[]
): void {
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === "string") {
      form.setError(field as Path<T>, { message: issue.message });
    }
  }
}
