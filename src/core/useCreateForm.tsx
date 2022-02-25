import React, {useMemo} from 'react'
import Form from './Form'
import {OnSubmit} from '../Types/Form'

type UseCreateFormParams<FormValue> = {
  initialData: FormValue
  onSubmit: OnSubmit<FormValue>
}
export const useCreateForm = <FormValue extends any>(params: UseCreateFormParams<FormValue>) => {
  const form = useMemo(
    () =>
      new Form({
        initialData: params.initialData,
        onSubmit: params.onSubmit,
      }),
    [],
  )
  return {
    Field: form.Field,
    FieldTest: () => <div>123</div>,
    submit: form.submit.bind(form),
  }
}
