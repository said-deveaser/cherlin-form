import React, {useEffect, useMemo, useRef, useState} from 'react'
import {CreateWithFieldValueParams, WithFieldValueProps} from '../types/WithFieldValue'

export const createWithFieldValue = <FormValues extends Record<string, any>>({formValuesStore, formErrorsStore}: CreateWithFieldValueParams) =>
  function <Value = string, Error = any>(props: WithFieldValueProps<Value, Error, FormValues>) {
    const formValues = formValuesStore.getFormValues() as FormValues
    const [_value, _setValue] = useState<Value>(() => formValuesStore.getFieldValue(props.fieldName))
    const [_error, _setError] = useState<Error>(() => formErrorsStore.getFieldError(props.fieldName))

    const isRenderedRef = useRef<boolean>(true)

    /*
     * subcribe Change value
     *  */
    useEffect(() => {
      const listener = formValuesStore.onFieldValueChange(props.fieldName, (value: Value) => {
        if (isRenderedRef.current) {
          _setValue(value)
        }
      })
      return () => {
        listener.remove()
      }
    }, [_setValue])

    /*
     * subcribe Change error
     *  */
    useEffect(() => {
      const listener = formErrorsStore.onFieldErrorChange(props.fieldName, (error: Error) => {
        if (isRenderedRef.current) {
          _setError(error)
        }
      })
      return () => {
        listener.remove()
      }
    }, [_setError])

    useEffect(() => {
      return () => {
        isRenderedRef.current = false
      }
    }, [])

    const RenderComponent = useMemo(() => props.render, [_value, _error])

    return (
      <React.Fragment>
        <RenderComponent
          field={{
            value: _value,
            fieldName: props.fieldName,
            error: _error,
          }}
          form={{
            formValues: formValues,
          }}
        />
      </React.Fragment>
    )
  }
