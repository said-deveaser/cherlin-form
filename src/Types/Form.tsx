export type FormConstructorParams<FormData extends any> = {
  initialData?: FormData
  onSubmit: OnSubmit<FormData>
  onSubmitFailed?: OnSubmitFailedFunction<FormData>
  debug?: boolean
}
export type AnyObject = {[K: string]: any}
export type OnSubmit<FormData extends any> = (data: FormData) => void | Promise<any>
export type RegisterChangeFunction = (fieldName: string, changeFieldValue: (value: any) => void) => () => void
export type RegisterValidateFunction = (fieldName: string, validateField: () => any) => () => void
export type OnSubmitFailedFunction<FormData extends any> = (data: FormData, firstError: any) => {}
