import type { FieldValues, Path, UseFormSetValue } from 'react-hook-form'

type SyncField<T extends FieldValues> = {
  id: string
  name: Path<T>
  trim?: boolean
}

/** Browser autofill often skips onChange — read DOM values before validating. */
export function syncAutofillToForm<T extends FieldValues>(
  form: HTMLFormElement,
  fields: SyncField<T>[],
  setValue: UseFormSetValue<T>,
): void {
  for (const { id, name, trim } of fields) {
    const input = form.querySelector<HTMLInputElement>(`#${id}`)
    if (!input?.value) continue

    const value = trim ? input.value.trim() : input.value
    setValue(name, value as T[Path<T>], { shouldValidate: true, shouldDirty: true })
  }
}
