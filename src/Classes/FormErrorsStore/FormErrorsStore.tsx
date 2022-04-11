type Error = any
type Path = string
type ErrorStore = Record<Path, Error>
type OnFieldErrorChangeCallback = (error: Error) => void

export class FormErrorsStore {
  private _errorStore: ErrorStore = {}

  private _onFieldErrorChangePathCallback: Record<Path, OnFieldErrorChangeCallback[]> = {}
  private _onShouldShowErrorCallbacks: (() => void)[] = []

  public setFieldError = (path: Path, error: Error) => {
    this._errorStore[path] = error

    if (Array.isArray(this._onFieldErrorChangePathCallback[path])) {
      this._onFieldErrorChangePathCallback[path].forEach(callback => callback(error))
    }
  }

  public getFieldError = (path: Path) => {
    return this._errorStore[path]
  }

  public getFormErrors = () => {
    return this._errorStore
  }

  public clearErrors = () => {
    this._errorStore = {}
  }

  public getIsError = () => {
    this._onShouldShowErrorCallbacks.forEach(callback => {
      callback()
    })
    return !!Object.values(this._errorStore).find(value => value !== undefined)
  }

  public onShouldShowError = (callback: () => void) => {
    const index = this._onShouldShowErrorCallbacks.push(callback) - 1
    return {
      remove: () => {
        this._onShouldShowErrorCallbacks.splice(index, 1)
      },
    }
  }

  public onFieldErrorChange = (path: Path, callback: OnFieldErrorChangeCallback) => {
    if (!Array.isArray(this._onFieldErrorChangePathCallback[path])) {
      this._onFieldErrorChangePathCallback[path] = []
    }
    this._onFieldErrorChangePathCallback[path].push(callback)

    return {
      remove: () => {
        if (Array.isArray(this._onFieldErrorChangePathCallback[path])) {
          const indexOfCallback = this._onFieldErrorChangePathCallback[path].indexOf(callback)
          if (indexOfCallback !== -1) {
            this._onFieldErrorChangePathCallback[path].splice(indexOfCallback, 1)
          }
        }
      },
    }
  }
}
