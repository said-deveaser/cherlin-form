import {AnyObject, FormConstructorParams, OnSubmit, OnSubmitFailedFunction, RegisterChangeFunction, RegisterValidateFunction} from '../Types/Form'
import {objectSet, pathParse} from './Helpers'
import {ReactNode, useState} from 'react'
import makeField from '../components/Field'
import {FieldChildrenMetaProp, FieldProps} from '../Types/Field'

class Form<FormData extends any> {
  private _formValues: any = {}
  private _onSubmit: OnSubmit<FormData>
  private _debug: boolean = false
  private _onSubmitFailed: OnSubmitFailedFunction<FormData> | undefined = undefined
  private _rerendersFuncs: {[K: string]: (() => void)[]} = {}

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
      onChangeFormField: this._onChangeFormValue.bind(this),
      registerChangeFunction: this._registerChangeFunction.bind(this),
      registerValidateFunction: this._registerValidateFunction.bind(this),
    })
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

  public change(fieldName: string, value: any) {
    const fieldChangeFuncs = this._registeredChangeFunction[fieldName]
    if (fieldChangeFuncs) {
      this._registeredChangeFunction[fieldName].forEach(changeFunc => {
        changeFunc(value)
      })
    } else {
      // rerender used show value by name
      objectSet({
        value: value,
        obj: this._formValues,
        path: fieldName,
      })
    }
  }


  // let useShowValueCount = 0
  /* Дотсает значение из формы по имени */
  public useShowValue = (fieldName: string, shouldRerender = false) => {
    if (!Array.isArray(this._rerendersFuncs[fieldName])) {
      this._rerendersFuncs[fieldName] = []
    }
  }

  /* Обноваляет те филды которые зависят от параметра fieldName */
  private _rerenderUsedShowValueByName = (fieldName: string) => {
    const takeNameFromPathSplitElem = (pathSlitItem: string | {array: string; index: number}, isLast?: boolean) => {
      if (typeof pathSlitItem === 'object') {
        if (isLast) return pathSlitItem.array
        else return pathSlitItem.array + `[${pathSlitItem.index}]`
      } else {
        return pathSlitItem
      }
    }
    const pathSplit = pathParse({path: fieldName})
    for (let i = pathSplit.length - 1; i >= 0; i--) {
      let name = takeNameFromPathSplitElem(pathSplit[i], true)
      let firstPathOfName = ''
      for (let j = 0; j < i; j++) {
        const pathSplitItem = pathSplit[j]
        if (j === 0) {
          firstPathOfName = takeNameFromPathSplitElem(pathSplitItem)
        } else {
          firstPathOfName += '.' + takeNameFromPathSplitElem(pathSplitItem)
        }
      }
      if (firstPathOfName) {
        name = firstPathOfName + '.' + name
      }
      if (rerender && rerender[name] && Array.isArray(rerender[name])) {
        rerender[name].forEach((rerenderFunc: any) => typeof rerenderFunc === 'function' && rerenderFunc())
      }
    }
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
  private _onChangeFormValue(fieldName: string, value: any) {
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
