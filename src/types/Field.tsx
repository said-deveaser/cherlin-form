import {FC, ReactNode} from 'react'
import {FormValuesStore} from '../Classes/FormValues/FormValuesStore'
import {FormErrorsStore} from '../Classes/FormErrorsStore/FormErrorsStore'

export type CreateFieldParams = {
  formValuesStore: FormValuesStore
  formErrorsStore: FormErrorsStore
}
export type FieldRenderProps<Value, Error, FormValues> = {
  field: {
    value: Value
    setValue: (value: Value) => void
    fieldName: string
  }
  form: {
    formValues: FormValues
  }
  meta: {
    error?: Error
    touched: boolean
  }
}
export type FieldProps<Value = any, Error = any, FormValues = Record<string, any>> = {
  name: string
  validate?: (param: {value: Value; formValues: FormValues}) => Error | undefined
  render: FC<FieldRenderProps<Value, Error, FormValues>>
}
