import {FC} from 'react'

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
export type FieldProps<Value, FormData> = {
  validate?: (value: Value | null, formValues: FormData) => any
  children: FC<FieldChildrenProps<Value>>
  name: string
}
