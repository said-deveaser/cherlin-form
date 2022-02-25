import { FC } from "react";

type FieldChildrenProps<Value> = {
  field: {
    value: Value | null
    onValueChange: (value: Value | null) => void
  }
  meta: {
    error: any
    touched: boolean
    metaDependentError: any
  }
}
export type FieldProps<Value> = {
  validate?: (value: Value | null, formValues: any) => any
  children: FC<FieldChildrenProps<Value>>
  name: string
}