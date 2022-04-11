import {FormValuesStore} from '../Classes/FormValues/FormValuesStore'
import {FormErrorsStore} from '../Classes/FormErrorsStore/FormErrorsStore'
import {FC} from 'react'

export type CreateWithFieldValueParams = {
  formValuesStore: FormValuesStore
  formErrorsStore: FormErrorsStore
}

export type WithFieldValueRenderProps<Value, Error, FormValues> = {
  field: {
    value: Value
    error: Error
    fieldName: string
  }
  form: {
    formValues: FormValues
  }
}
export type WithFieldValueProps<Value, Error, FormValues> = {
  fieldName: string
  render: FC<WithFieldValueRenderProps<Value, Error, FormValues>>
}
