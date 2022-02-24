import {AnyObject, FormConstructorParams, OnSubmit, RegisterChangeFunction, RegisterValidateFunction} from '../Types/Form'
import {objectSet} from './Helpers'
import {ReactNode} from 'react'
import makeField from '../components/Field'
import {FieldProps} from '../Types/Field'

class Form<FormData extends any> {
  private _formValues: any = {}
  private _onSubmit: OnSubmit<FormData>
  public Field: <Value extends any>(props: FieldProps<Value>) => ReactNode
  constructor(params: FormConstructorParams<FormData>) {
    if (params.initialData) {
      this._initializeForm(params.initialData)
    }
    this._onSubmit = params.onSubmit
    this.Field = makeField({
      formValues: this._formValues,
      changeFormField: this._changeFormValue.bind(this),
      registerChangeFunction: this._registerChangeFunction.bind(this),
      registerValidateFunction: this._registerValidateFunction.bind(this),
    })
  }

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
  }

  /*
   * submit сабмитит форму
   *  */
  public submit() {
    let hasError = false
    Object.values(this._registeredValidateFunction).forEach(filedValidateFunctionsArray => {
      filedValidateFunctionsArray.forEach(validateFunc => {
        if (!hasError) {
          if (!(validateFunc === null || validateFunc === undefined)) {
            hasError = true
          }
        }
      })
    })
    if (!hasError) {
      this._onSubmit(this._formValues)
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
