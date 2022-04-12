import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {CreateFieldParams, FieldProps} from '../types/Field'

export const createField = <FormValues extends Record<string, any>>({formValuesStore, formErrorsStore}: CreateFieldParams) =>
  function <Value = string, Error = string>(props: FieldProps<Value, Error, FormValues>) {
    const initialFormFieldValue = formValuesStore.getFieldValue(props.name) as Value
    const formValues = formValuesStore.getFormValues() as FormValues

    const [_fieldStatedValue, _setFieldStatedValue] = useState<Value>(initialFormFieldValue)
    const [_fieldStatedError, _setFieldStatedError] = useState<Error>()
    const [_fieldStatedTouched, _setFieldStatedTouched] = useState<boolean>(false)

    const isRenderedRef = useRef(true)

    const setValueToFormValuesStore = useCallback((value: Value) => {
      formValuesStore.setFieldValue(props.name, value)
    }, [])

    const setErrorToFormErrorsStore = useCallback((error: Error | undefined) => {
      formErrorsStore.setFieldError(props.name, error)
    }, [])

    /*
     * On formValuesStoreCurrentFieldValueChange
     *  */
    useEffect(() => {
      const listener = formValuesStore.onFieldValueChange(props.name, (value: Value, helper) => {
        if (isRenderedRef.current) {
          console.log('RERENDER ON CHANGE', value)
          _setFieldStatedValue(value)
          _setFieldStatedTouched(typeof helper?.touched === 'boolean' ? helper.touched : true)
        }
      })
      return () => {
        listener.remove()
      }
    }, [_setFieldStatedValue, _setFieldStatedTouched])

    /*
     * On formErrorsStoreCurrentFieldErrorChange
     *  */
    useEffect(() => {
      const listener = formErrorsStore.onFieldErrorChange(props.name, (error: Error | undefined) => {
        if (isRenderedRef.current) {
          _setFieldStatedError(error)
        }
      })
      return () => {
        listener.remove()
      }
    }, [])

    /*
     * change meta onSubmit
     *  */
    useEffect(() => {
      const listener = formErrorsStore.onShouldShowError(() => {
        _setFieldStatedTouched(true)
      })
      return () => {
        listener.remove()
      }
    }, [_setFieldStatedTouched])

    useEffect(
      () => () => {
        isRenderedRef.current = false
      },
      [],
    )
    const value = _fieldStatedValue
    const error = _fieldStatedError
    const touched = _fieldStatedTouched

    /*
     * validate.
     * Нужно это юз эффект держать взину
     *  */
    useEffect(() => {
      if (props.validate) {
        const error = props.validate(value, formValues)
        setErrorToFormErrorsStore(error)
      }
    }, [value])

    // const RenderComponent = useMemo(() => props.render, [value, error, touched, setValueToFormValuesStore, props.validate])
    const RenderComponent = props.render
    return (
      <React.Fragment>
        <RenderComponent
          field={useMemo(
            () => ({
              setValue: setValueToFormValuesStore,
              value: value,
              fieldName: props.name,
            }),
            [value, setValueToFormValuesStore],
          )}
          form={useMemo(
            () => ({
              formValues: formValues,
            }),
            [],
          )}
          meta={useMemo(
            () => ({
              error: error,
              touched: touched,
            }),
            [error, touched],
          )}
        />
      </React.Fragment>
    )
  }

// const Field = function <Value = string, Error = string, FormValues = Record<string, any>>({formValuesStore, formErrorsStore, ...props}: FieldProps<Value, Error, FormValues> & CreateFieldParams) {
//   const initialFormFieldValue = formValuesStore.getFieldValue(props.name) as Value
//   const formValues = formValuesStore.getFormValues() as FormValues
//
//   const [_fieldStatedValue, _setFieldStatedValue] = useState<Value>(initialFormFieldValue)
//   const [_fieldStatedError, _setFieldStatedError] = useState<Error>()
//   const [_fieldStatedTouched, _setFieldStatedTouched] = useState<boolean>(false)
//
//   const isRenderedRef = useRef(true)
//
//   const setValueToFormValuesStore = useCallback((value: Value) => {
//     formValuesStore.setFieldValue(props.name, value)
//   }, [])
//
//   const setErrorToFormErrorsStore = useCallback((error: Error | undefined) => {
//     formErrorsStore.setFieldError(props.name, error)
//   }, [])
//
//   /*
//    * On formValuesStoreCurrentFieldValueChange
//    *  */
//   useEffect(() => {
//     const listener = formValuesStore.onFieldValueChange(props.name, (value: Value, helper) => {
//       if (isRenderedRef.current) {
//         console.log('RERENDER ON CHANGE', value)
//         _setFieldStatedValue(value)
//         _setFieldStatedTouched(typeof helper?.touched === 'boolean' ? helper.touched : true)
//       }
//     })
//     return () => {
//       listener.remove()
//     }
//   }, [_setFieldStatedValue, _setFieldStatedTouched])
//
//   /*
//    * On formErrorsStoreCurrentFieldErrorChange
//    *  */
//   useEffect(() => {
//     const listener = formErrorsStore.onFieldErrorChange(props.name, (error: Error | undefined) => {
//       if (isRenderedRef.current) {
//         _setFieldStatedError(error)
//       }
//     })
//     return () => {
//       listener.remove()
//     }
//   }, [])
//
//   /*
//    * change meta onSubmit
//    *  */
//   useEffect(() => {
//     const listener = formErrorsStore.onShouldShowError(() => {
//       _setFieldStatedTouched(true)
//     })
//     return () => {
//       listener.remove()
//     }
//   }, [_setFieldStatedTouched])
//
//   useEffect(
//     () => () => {
//       isRenderedRef.current = false
//     },
//     [],
//   )
//   const value = _fieldStatedValue
//   const error = _fieldStatedError
//   const touched = _fieldStatedTouched
//
//   /*
//    * validate.
//    * Нужно это юз эффект держать взину
//    *  */
//   useEffect(() => {
//     if (props.validate) {
//       const error = props.validate(value, formValues)
//       setErrorToFormErrorsStore(error)
//     }
//   }, [value])
//
//   // const RenderComponent = useMemo(() => props.render, [value, error, touched, setValueToFormValuesStore, props.validate])
//   const RenderComponent = props.render
//   return (
//     <React.Fragment>
//       <RenderComponent
//         field={useMemo(
//           () => ({
//             setValue: setValueToFormValuesStore,
//             value: value,
//             fieldName: props.name,
//           }),
//           [value, setValueToFormValuesStore],
//         )}
//         form={useMemo(
//           () => ({
//             formValues: formValues,
//           }),
//           [],
//         )}
//         meta={useMemo(
//           () => ({
//             error: error,
//             touched: touched,
//           }),
//           [error, touched],
//         )}
//       />
//     </React.Fragment>
//   )
// }
