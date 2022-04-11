import {objectGet, objectSet} from '../../helpers/Helpers'

type FormValues = Record<string, any>
type FromValuesMeta = {
  pristine: boolean
}
type FormValuesConstructorParam = {
  initialValue?: FormValues
}
type OnFieldValueChangeCallback = (
  value: any,
  anyData?: {
    touched?: boolean
  },
) => void
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

  private _runOnFieldValueChangeCallbacks = (path: Path) => {
    Object.keys(this._onFieldValueChangePathedCallbacks).forEach(pathOfAll => {
      const RE = new RegExp('^' + pathOfAll.replace(/[[\]]/g, `\\$&`) + '($|[.]|[[])')
      const RE2 = new RegExp('^' + path.replace(/[[\]]/g, `\\$&`) + +'($|[.]|[[])')
      // console.log(RE, RE2, RE.test(path), RE2.test(pathOfAll))
      if (RE.test(path) || RE2.test(pathOfAll)) {
        if (Array.isArray(this._onFieldValueChangePathedCallbacks[pathOfAll])) {
          this._onFieldValueChangePathedCallbacks[pathOfAll].forEach(callback => {
            const value = this.getFieldValue(pathOfAll)
            callback(value)
          })
        }
      }
    })
  }

  public initialize = (newFormValues: FormValues) => {
    this.formValues = newFormValues

    Object.keys(this._onFieldValueChangePathedCallbacks).forEach((path: Path) => {
      if (Array.isArray(this._onFieldValueChangePathedCallbacks[path])) {
        const pathValue = this.getFieldValue(path)
        this._onFieldValueChangePathedCallbacks[path].forEach(callback => callback(pathValue, {touched: false}))
      }
    })
  }

  public getFieldValue = (path: Path) => {
    let value = objectGet({
      obj: this.formValues,
      path,
    })
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        value = Object.assign([], value)
      } else {
        value = Object.assign({}, value)
      }
    }
    return value
  }

  public setFieldValue = (path: Path, value: any) => {
    objectSet({
      obj: this.formValues,
      path,
      value,
    })
    this._runOnFieldValueChangeCallbacks(path)
    // if (Array.isArray(this._onFieldValueChangePathedCallbacks[path])) {
    //   this._onFieldValueChangePathedCallbacks[path].forEach(callback => callback(value))
    // }
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
