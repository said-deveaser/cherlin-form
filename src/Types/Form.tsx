export interface IForm {}
export type FormConstructorParams<FormData extends any> = {
  initialData?: FormData
  onSubmit: OnSubmit<FormData>
}
export type AnyObject = { [K: string]: any }
export type OnSubmit<FormData extends any> = (data: FormData) => void | Promise<any>
