import React, {FC, useEffect, useMemo, useState} from 'react'
import {FieldProps} from '../Types/Field'
import {RegisterChangeFunction, RegisterValidateFunction} from '../Types/Form'

type MakeFieldParams<FormValues> = {
  changeFormField: (fieldName: string, value: any) => void
  formValues: FormValues
  registerChangeFunction: RegisterChangeFunction
  registerValidateFunction: RegisterValidateFunction
}
const makeField =
  <FormValues extends any>({changeFormField, formValues, registerChangeFunction, registerValidateFunction}: MakeFieldParams<FormValues>) =>
  <Value extends any>(props: FieldProps<Value>) => {
    const {value, validate, children, name} = props

    const [_error, _setError] = useState<any>(undefined)
    const [_touched, _setTouched] = useState(false)
    const [_value, _setValue] = useState<Value | null>(value)

    const _validate = (value: Value | null) => {
      if (!_touched) {
        _setTouched(true)
      }
      if (validate) {
        const error = validate(value, formValues)
        if (error) {
          _setError(error)
        }
        return error
      }
      return undefined
    }
    const _changeValue = (value: Value | null) => {
      changeFormField(name, value)
      _setValue(value)
      _validate(value)
    }

    /* REGISTER FIELDS FUNCTION TO FORM */
    useEffect(() => {
      const unregisterChange = registerChangeFunction(name, _changeValue)
      const unregisterValidate = registerValidateFunction(name, () => _validate(_value))
      return () => {
        unregisterChange()
        unregisterValidate()
      }
    }, [])

    const Children = children
    const childrenComponent = useMemo(
      () => (
        <Children
          meta={{
            error: _error,
            touched: _touched,
            metaDependentError: (_touched && _error) || undefined,
          }}
          field={{
            onValueChange: _changeValue,
            value: _value,
          }}
        />
      ),
      [_value],
    )

    return <>{childrenComponent}</>
  }
export default makeField
