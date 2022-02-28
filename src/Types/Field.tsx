import {FC} from 'react'

export type FieldChildrenMetaProp = {
  error: any
  touched: boolean
  metaDependentError: any
}
export type FieldChildrenProps<Value> = {
  field: {
    value: Value | null
    onValueChange: (value: Value | null) => void
  }
  meta: FieldChildrenMetaProp
}
export type FieldProps<Value, FormData> = {
  validate?: (value: Value | null, formValues: FormData) => any
  children: FC<FieldChildrenProps<Value>>
  name: string
}
