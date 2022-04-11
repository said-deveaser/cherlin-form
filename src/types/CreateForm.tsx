export type FormHelpers<FormValues> = {
  initialize: (formValues: FormValues) => void
  change: (fieldName: string, value: any) => void
}
export type UseCreateFormParam<FormValues> = {
  // destroy
  onSubmitSuccess?: (formValues: FormValues, formHelpers: FormHelpers<FormValues>) => void | Promise<any>
  onSubmitError?: (formValues: FormValues, formErros: Record<string, any>, formHelpers: FormHelpers<FormValues>) => void
  initialValues?: FormValues
}
