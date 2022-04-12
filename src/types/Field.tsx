import {FC} from 'react'
import {FormValuesStore} from '../Classes/FormValues/FormValuesStore'
import {FormErrorsStore} from '../Classes/FormErrorsStore/FormErrorsStore'

export type CreateFieldParams = {
  formValuesStore: FormValuesStore
  formErrorsStore: FormErrorsStore
}
export type FieldDataProps<Value = string, Props = Record<string, any>> = {
  value: Value
  setValue: (value: Value) => void
  fieldName: string
  props?: Props
}
export type FieldRenderProps<Value, Error, FormValues, Props> = {
  field: FieldDataProps<Value, Props>
  form: {
    formValues: FormValues
  }
  meta: {
    error?: Error
    touched: boolean
  }
}
export type ValidateFunc<Value = string, Error = string, FormValues = Record<string, any>> = (value: Value, formValues: FormValues) => Error | undefined
export type FieldProps<Value = string, Error = string, FormValues = Record<string, any>, Props = Record<string, any>> = {
  name: string
  validate?: ValidateFunc<Value, Error, FormValues>
  render: FC<FieldRenderProps<Value, Error, FormValues, Props>>
  props?: Props
}
