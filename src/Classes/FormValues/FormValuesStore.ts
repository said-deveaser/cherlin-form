import {objectGet, objectSet} from '../../helpers/Helpers'

type FormValues = Record<string, any>
type FromValuesMeta = {
  pristine: boolean
}
type FormValuesConstructorParam = {
  initialValue?: FormValues
}
type OnFieldValueChangeCallback = (value: any) => void
type Path = string

export class FormValuesStore {
  private formValues: FormValues = {}
  private formValuesMeta: FromValuesMeta = {
    pristine: true,
  }

  private _onFieldValueChangePathedCallbacks: Record<Path, OnFieldValueChangeCallback[]> = {}

  constructor(params?: FormValuesConstructorParam) {
    if (params?.initialValue) this.formValues = params.initialValue
  }

  public initialize = (newFormValues: FormValues) => {
    this.formValues = newFormValues

    Object.keys(this._onFieldValueChangePathedCallbacks).forEach((path: Path) => {
      if (Array.isArray(this._onFieldValueChangePathedCallbacks[path])) {
        const pathValue = this.getFieldValue(path)
        this._onFieldValueChangePathedCallbacks[path].forEach(callback => callback(pathValue))
      }
    })
  }

  public getFieldValue = (path: Path) => {
    return objectGet({
      obj: this.formValues,
      path,
    })
  }

  public setFieldValue = (path: Path, value: any) => {
    objectSet({
      obj: this.formValues,
      path,
      value,
    })
    if (Array.isArray(this._onFieldValueChangePathedCallbacks[path])) {
      this._onFieldValueChangePathedCallbacks[path].forEach(callback => callback(value))
    }
  }

  public getFormValues = () => {
    return this.formValues
  }

  public onFieldValueChange = (path: Path, callback: OnFieldValueChangeCallback) => {
    if (!Array.isArray(this._onFieldValueChangePathedCallbacks[path])) this._onFieldValueChangePathedCallbacks[path] = []
    this._onFieldValueChangePathedCallbacks[path].push(callback)
    return {
      remove: () => {
        if (Array.isArray(this._onFieldValueChangePathedCallbacks[path])) {
          const indexOfCallback = this._onFieldValueChangePathedCallbacks[path].indexOf(callback)
          if (indexOfCallback !== -1) {
            this._onFieldValueChangePathedCallbacks[path].splice(indexOfCallback, 1)
          }
        }
      },
    }
  }
}
