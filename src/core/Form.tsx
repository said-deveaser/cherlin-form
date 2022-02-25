import {AnyObject, FormConstructorParams, OnSubmit, OnSubmitFailedFunction, RegisterChangeFunction, RegisterValidateFunction} from '../Types/Form'
import {objectSet} from './Helpers'
import {ReactNode} from 'react'
import makeField from '../components/Field'
import {FieldProps} from '../Types/Field'

class Form<FormData extends any> {
  private _formValues: any = {}
  private _onSubmit: OnSubmit<FormData>
  private _debug: boolean = false
  private _onSubmitFailed: OnSubmitFailedFunction<FormData> | undefined = undefined

  public Field: <Value extends any>(props: FieldProps<Value, FormData>) => JSX.Element

  constructor(params: FormConstructorParams<FormData>) {
    if (params.initialData) {
      this._initializeForm(params.initialData)
    }
    this._onSubmit = params.onSubmit
    if (params.debug) {
      this._debug = params.debug
    }
    if (params.onSubmitFailed) {
      this._onSubmitFailed = params.onSubmitFailed
    }
    this.Field = makeField({
      formValues: this._formValues,
      changeFormField: this._changeFormValue.bind(this),
      registerChangeFunction: this._registerChangeFunction.bind(this),
      registerValidateFunction: this._registerValidateFunction.bind(this),
    })
  }

  // public getDataToMakeField = () => {
  //   return {
  //     formValues: this._formValues,
  //     changeFormField: this._changeFormValue.bind(this),
  //     registerChangeFunction: this._registerChangeFunction.bind(this),
  //     registerValidateFunction: this._registerValidateFunction.bind(this),
  //   }
  // }

  private _initializeForm = (initialValue: FormData) => {
    this._formValues = initialValue
  }

  /*
   * ф-я дает возможность изменить _formValues
   * */
  private _changeFormValue(fieldName: string, value: any) {
    this._formValues = objectSet({
      value: value,
      obj: this._formValues,
      path: fieldName,
    })
    if (this._debug) {
      console.log('FormValues', this._formValues)
    }
  }

  /*
   * submit сабмитит форму
   *  */
  public submit() {
    let firstError: any = false
    Object.values(this._registeredValidateFunction).forEach(filedValidateFunctionsArray => {
      filedValidateFunctionsArray.forEach(validateFunc => {
        if (!firstError) {
          const potentialError = validateFunc()
          if (!(potentialError === null || potentialError === undefined)) {
            firstError = potentialError
          }
        }
      })
    })
    if (this._debug) {
      console.log('hasError', firstError)
    }
    if (!firstError) {
      this._onSubmit(this._formValues)
    } else if (this._onSubmitFailed) {
      this._onSubmitFailed(this._formValues, firstError)
    }
  }

  /*
   * Регистрирует ф-и изменения Field
   *  */
  private _registeredChangeFunction: {[K: string]: ((value: any) => void)[]} = {}

  private _registerChangeFunction: RegisterChangeFunction = (fieldName, changeFieldValue) => {
    if (!Array.isArray(this._registeredChangeFunction[fieldName])) {
      this._registeredChangeFunction[fieldName] = []
    }
    this._registeredChangeFunction[fieldName].push(changeFieldValue)
    return () => {
      if (Array.isArray(this._registeredChangeFunction[fieldName])) {
        const index = this._registeredChangeFunction[fieldName].indexOf(changeFieldValue)
        this._registeredChangeFunction[fieldName].splice(index, 1)
      }
    }
  }

  /*
   * Регистрирует ф-и валидации Field
   *  */
  private _registeredValidateFunction: {[K: string]: (() => any)[]} = {}

  private _registerValidateFunction: RegisterValidateFunction = (fieldName, validateField) => {
    if (!Array.isArray(this._registeredValidateFunction[fieldName])) {
      this._registeredValidateFunction[fieldName] = []
    }
    this._registeredValidateFunction[fieldName].push(validateField)
    return () => {
      if (Array.isArray(this._registeredValidateFunction[fieldName])) {
        const index = this._registeredValidateFunction[fieldName].indexOf(validateField)
        this._registeredValidateFunction[fieldName].splice(index, 1)
      }
    }
  }
}
export default Form
