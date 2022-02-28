import React, {useEffect, useMemo, useState} from 'react'
import {FieldProps} from '../Types/Field'
import {RegisterChangeFunction, RegisterValidateFunction} from '../Types/Form'
import {objectGet} from '../core/Helpers'

type MakeFieldParams<FormValues> = {
  onChangeFormField: (fieldName: string, value: any) => void
  formValues: FormValues
  registerChangeFunction: RegisterChangeFunction
  registerValidateFunction: RegisterValidateFunction
}
const makeField =
  <FormData extends any>({onChangeFormField, formValues, registerChangeFunction, registerValidateFunction}: MakeFieldParams<FormData>) =>
  <Value extends any>(props: FieldProps<Value, FormData>): JSX.Element => {
    const {validate, children, name} = props

    const [_error, _setError] = useState<any>(undefined)
    const [_touched, _setTouched] = useState(false)
    // @ts-ignore
    const [_value, _setValue] = useState<Value | null>(objectGet({path: name, obj: formValues}) || null)

    const _validate = (value: Value | null) => {
      if (!_touched) {
        _setTouched(true)
      }
      if (validate) {
        const error = validate(value, formValues)
        if (error && !_error) {
          _setError(error)
        } else if (!error && _error) {
          _setError(undefined)
        }
        return error
      }
      return undefined
    }
    const _changeValue = (value: Value | null) => {
      onChangeFormField(name, value)
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
    })

    const Children = children
    const childComponent = useMemo(
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
      [_value, _touched, _error],
    )

    // return <div>{childComponent}</div>
    return (
      <React.Fragment>
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
      </React.Fragment>
    )
  }
export default makeField
