import {FormValuesStore} from './Classes/FormValues/FormValuesStore'
import {useCallback, useMemo} from 'react'
import {createField} from './components/Field'
import {FormErrorsStore} from './Classes/FormErrorsStore/FormErrorsStore'
import {createWithFieldValue} from './components/WithFieldValue'
import {FormHelpers, UseCreateFormParam} from './types/CreateForm'

export const useCreateForm = <FormValues extends Record<string, any>>(params: UseCreateFormParam<FormValues>) /* : CreateFormReturnType */ => {
  const formValuesStore = useMemo(
    () =>
      new FormValuesStore({
        initialValue: params.initialValues,
      }),
    [],
  )
  const formErrorsStore = useMemo(() => new FormErrorsStore(), [])

  const Field = useMemo(() => createField<FormValues>({formValuesStore, formErrorsStore}), [])
  const WithFieldValue = useMemo(() => createWithFieldValue<FormValues>({formValuesStore, formErrorsStore}), [])

  const initialize = useCallback((newFormValues: FormValues) => {
    formErrorsStore.clearErrors()
    formValuesStore.initialize(newFormValues)
  }, [])

  const submit = () => {
    if (formErrorsStore.getIsError()) {
      params.onSubmitError?.(formValuesStore.getFormValues() as FormValues, formErrorsStore.getFormErrors(), formHelpers)
    } else {
      params.onSubmitSuccess?.(formValuesStore.getFormValues() as FormValues, formHelpers)
    }
  }
  const change = (fieldName: string, value: any) => {
    formValuesStore.setFieldValue(fieldName, value)
  }

  const formHelpers: FormHelpers<FormValues> = {
    initialize,
    change,
  }

  return {
    Field,
    WithFieldValue,
    submit,
    formHelpers: formHelpers,
    /*
     * TEMP
     *  */
    formValuesStore,
    formErrorsStore,
  }
}
