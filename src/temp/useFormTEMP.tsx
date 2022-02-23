import React, {ReactElement, useEffect, useMemo, useRef, useState} from 'react'
import {FC} from 'react'
import logging from '../../funcs/logging/Logging'
import {customAlert} from '../../funcs/customAlert/CustomAlert'

/*
 * TODO: Будет дописываться
 * */
export const useForm = <FormData extends any>(params: FormProps<FormData>) => {
  const [submitting, setSubmitting] = React.useState(false)
  const [form] = React.useState(() => new Form<FormData>(params))
  const onSubmit: OnSubmit<FormData> = async (...onSubmitParams) => {
    setSubmitting(true)
    try {
      const result = await params.onSubmit(...onSubmitParams)
      setSubmitting(false)
      return result
    } catch (e) {
      setSubmitting(false)
    }
  }
  form._onSubmit = onSubmit.bind(form)
  return {
    FormFieldWrapper: form.FieldWrapper,
    useFieldValue: form.useFieldValue.bind(form),
    submit: form.submit.bind(form),
    setFieldMeta: form.setFieldMeta.bind(form),
    meta: {
      submitting,
    },
    change: form.change.bind(form),
    getValue: form.getValue.bind(form),
    initialize: form.initialize.bind(form),
    // initialize
  }
}

/* Одиночные сущности */
type FieldMetaError = string | undefined | any
type ChangeFunction = (data: any) => void
type ChangeMetaFunction = (meta: Partial<FieldMetaProps>) => void
type SetFieldMetaFunction = (name: string, meta: Partial<FieldMetaProps>) => void
type ValidateFunction<FormData> = (formData?: Partial<FormData>) => FieldMetaError
export type OnSubmit<FormData extends any> = (data: FormData, controller: OnSubmitController) => Promise<any> | void
type OnSubmitController = {setFieldMeta: SetFieldMetaFunction}

type FormMeta = {
  submitting: boolean
}

/* То что возвращает FieldWrapper*/
type FieldProps = {
  controller: FieldControllerProps
  meta: FieldMetaProps
}
type FieldControllerProps = {
  value: any
  setValue: ChangeFunction
}
type FieldMetaProps = {
  error: FieldMetaError
  touched: boolean
  submitted: boolean
  controlledError: any
}

/* Проспсы FieldWrapper*/
type FieldWrapperProps<FormData> = {
  name: string
  validate?: (value: any, formValues: Partial<FormData>) => FieldMetaError
  parse?: (value: any) => any
  children: FC<FieldProps>
  memoDeps?: any[]
}

/* Пропсы для хука */
type FormProps<FormData extends any> = {
  initialValue?: Partial<FormData>
  onSubmit: (data: FormData, controller: OnSubmitController) => Promise<any> | void
  onSubmitFailed?: () => any
  debug?: boolean
}
// export type FormFieldWrapperType = (params: FieldWrapperProps) => ReactElement<any, any>
export type FormFieldWrapperType<FormData = any> =
  | React.MemoExoticComponent<(props: FieldWrapperProps<FormData>) => ReactElement>
  | ((props: FieldWrapperProps<FormData>) => ReactElement)
export type UseFieldValue = (name: string) => any
export type FormChangeFunction = (name: string, value: any) => void
export type Initialize<FormData> = (data: {formValue?: Partial<FormData>}) => void

class Form<FormData extends any> {
  private _formValues: any = {}
  public _onSubmit?: (data: FormData, controller: OnSubmitController) => Promise<any> | void
  private _onSubmitFailed: ((...p: any) => any) | undefined = undefined
  private debug?: boolean

  // change
  // initialize

  public FieldWrapper: FormFieldWrapperType<FormData>
  public submit: () => void
  public change: FormChangeFunction
  public useFieldValue: UseFieldValue
  public setFieldMeta: SetFieldMetaFunction
  public getValue: (name: string) => any
  public initialize: Initialize<FormData>

  constructor(params: FormProps<FormData>) {
    if (params.initialValue) {
      this._formValues = params.initialValue
    }
    if (params.onSubmitFailed) {
      this._onSubmitFailed = params.onSubmitFailed
    }
    this._onSubmit = params.onSubmit

    this.FieldWrapper = this._FieldWrapper
    this.submit = this._submit.bind(this)
    this.change = this._change.bind(this)
    this.useFieldValue = this._useFieldValue.bind(this)
    this.setFieldMeta = this._setFieldMeta.bind(this)
    this.getValue = this._getValue.bind(this)
    this.initialize = this._initialize.bind(this)
    this.debug = params.debug
  }

  private _registeredChangeFunctions: {[K: string]: ChangeFunction[]} = {}
  private _registeredChangeMetaFunctions: {[K: string]: ChangeMetaFunction[]} = {}
  private _registeredValidateFunctions: {[K: string]: ValidateFunction<FormData>[]} = {}
  private _registeredInitializeFunction: {[K: string]: () => void} = {}
  private _FieldWrapper = (props: FieldWrapperProps<FormData>) => {
    /*meta*/
    const [_touched, _setTouched] = React.useState(false)
    const [_submitted, _setSubmitted] = React.useState(false)
    const [_error, _setError] = React.useState<FieldMetaError>('')
    const _meta = {
      touched: _touched,
      submitted: _submitted,
      error: _error,
      controlledError: _submitted && _error,
    }
    /*contorl*/
    const [_value, _setValue] = React.useState<any>(objectGet({obj: this._formValues, path: props.name}) ?? '')

    /*
     * Подписываем initialize
     * Эта ф-я вызывается, после вызыва Form.initilize
     * И подтягивает данные нужны для филда
     * */
    useEffect(() => {
      let initializeFunc = () => {
        const value = objectGet({obj: this._formValues, path: props.name})
        _setValue(value)
        _setTouched(false)
        _setSubmitted(false)
        _setError('')
      }
      /*ЕСЛИ ХОТИМ ИСПОЛЬЗОВАТЬ НЕСКОЛЬКО ФИЛДОВ, ТО НУЖНО ПОМЕНЯТЬ НА МАССИВ*/
      this._registeredInitializeFunction[props.name] = initializeFunc
      return () => {
        delete this._registeredInitializeFunction[props.name]
      }
    })

    /*
     * Подписываем change
     * */
    useEffect(() => {
      const _change: ChangeFunction = _pristineValue => {
        const _newValue = props.parse?.(_pristineValue) ?? _pristineValue
        if (!_touched) {
          _setTouched(true)
        }
        _setError(props.validate?.(_newValue, this._formValues))
        _setValue(_newValue)
        objectSet({
          obj: this._formValues,
          path: props.name,
          value: _newValue,
        })
        this._rerenderUsedShowValueByName(props.name)
      }
      if (Array.isArray(this._registeredChangeFunctions[props.name])) {
        this._registeredChangeFunctions[props.name].push(_change)
      } else {
        this._registeredChangeFunctions[props.name] = [_change]
      }
      return () => {
        if (Array.isArray(this._registeredChangeFunctions[props.name])) {
          const index = this._registeredChangeFunctions[props.name].indexOf(_change)
          this._registeredChangeFunctions[props.name].splice(index, 1)
        }
      }
    }) // Подписываем change

    /*
     * Подписываем ChangeMeta
     * */
    useEffect(() => {
      const _changeMeta: ChangeMetaFunction = newMeta => {
        if (newMeta.error) {
          _setError(newMeta.error)
        }
        if (newMeta.touched) {
          _setTouched(newMeta.touched)
        }
        if (newMeta.submitted) {
          _setSubmitted(newMeta.submitted)
        }
      }
      if (Array.isArray(this._registeredChangeMetaFunctions[props.name])) {
        this._registeredChangeMetaFunctions[props.name].push(_changeMeta)
      } else {
        this._registeredChangeMetaFunctions[props.name] = [_changeMeta]
      }
      return () => {
        if (Array.isArray(this._registeredChangeMetaFunctions[props.name])) {
          const index = this._registeredChangeMetaFunctions[props.name].indexOf(_changeMeta)
          this._registeredChangeMetaFunctions[props.name].splice(index, 1)
        }
      }
    }) // Подписываем ChangeMeta

    /*
     * Подписываем validate
     * */
    const _validate: ValidateFunction<FormData> = (formValues?: Partial<FormData>) => {
      const err = props.validate?.(_value, formValues ?? this._formValues)
      _setError(err)
      return err
    }
    useEffect(() => {
      if (Array.isArray(this._registeredValidateFunctions[props.name])) {
        this._registeredValidateFunctions[props.name].push(_validate)
      } else {
        this._registeredValidateFunctions[props.name] = [_validate]
      }
      return () => {
        if (Array.isArray(this._registeredValidateFunctions[props.name])) {
          const index = this._registeredValidateFunctions[props.name].indexOf(_validate)
          this._registeredValidateFunctions[props.name].splice(index, 1)
        }
      }
    }) // Подписываем validate

    useEffect(() => {
      _validate()
    }, [])

    // Вызываем change у всех филдов с одинаковым именем
    const onChange: ChangeFunction = data => {
      if (Array.isArray(this._registeredChangeFunctions[props.name])) {
        this._registeredChangeFunctions[props.name].forEach(change => change(data))
      }
      if (this.debug) {
        logging.debug('UseForm Data: ', this._formValues)
      }
    }
    const _fieldControlProps: FieldControllerProps = {
      setValue: onChange,
      value: _value,
    }
    const _fieldMetaProps = _meta

    // const Component = useMemo(() => props.children, [])
    const Component = props.children
    return (
      <>
        <Component meta={_fieldMetaProps} controller={_fieldControlProps} />
      </>
    )
  }
  private _change = (name: string, value: any) => {
    if (this._registeredChangeFunctions[name]) {
      this._registeredChangeFunctions[name].forEach(func => func(value))
    } else {
      objectSet({
        obj: this._formValues,
        path: name,
        value,
      })
    }
  }
  private _useShowValueRerenderFunctions: {[K: string]: (() => void)[]} = {}
  private _useFieldValue = (_name: string) => {
    if (!Array.isArray(this._useShowValueRerenderFunctions[_name])) {
      this._useShowValueRerenderFunctions[_name] = []
    }
    const count = useRef(this._useShowValueRerenderFunctions[_name].length).current
    this._useShowValueRerenderFunctions[_name][count] = useForce()
    useEffect(() => {
      return () => {
        if (this._useShowValueRerenderFunctions[_name][count]) {
          delete this._useShowValueRerenderFunctions[_name][count]
        }
      }
    }, [])

    return objectGet({obj: this._formValues, path: _name})
  }
  private _rerenderUsedShowValueByName(name: string) {
    const takeNameFromPathSplitElem = (pathSlitItem: string | {array: string; index: number}, isLast?: boolean) => {
      if (typeof pathSlitItem === 'object') {
        if (isLast) {
          return pathSlitItem.array
        } else {
          return pathSlitItem.array + `[${pathSlitItem.index}]`
        }
      } else {
        return pathSlitItem
      }
    }
    const pathSplit = pathParse({path: name})

    for (let i = pathSplit.length - 1; i >= 0; i--) {
      let name = takeNameFromPathSplitElem(pathSplit[i], true)
      let firstPathOfName = ''
      for (let j = 0; j < i; j++) {
        let pathSplitItem = pathSplit[j]
        if (j === 0) {
          firstPathOfName = takeNameFromPathSplitElem(pathSplitItem)
        } else {
          firstPathOfName += '.' + takeNameFromPathSplitElem(pathSplitItem)
        }
      }
      if (firstPathOfName) {
        name = firstPathOfName + '.' + name
      }
      const rerender = this._useShowValueRerenderFunctions
      if (rerender && rerender[name] && Array.isArray(rerender[name])) {
        rerender[name].forEach((rerenderFunc: any) => typeof rerenderFunc === 'function' && rerenderFunc())
      }
    }
  }
  private _getValue = (name: string) => {
    return objectGet({
      obj: this._formValues,
      path: name,
    })
  }
  private _setFieldMeta: SetFieldMetaFunction = (name, meta) => {
    this._registeredChangeMetaFunctions[name]?.forEach(setFieldMeta =>
      setFieldMeta({
        ...meta,
      }),
    )
  }
  private _initialize: Initialize<FormData> = data => {
    if (data.formValue) {
      this._formValues = data.formValue
    }
    Object.values(this._registeredInitializeFunction).forEach(initField => initField?.())
  }
  private _submit = () => {
    let isError: FieldMetaError
    const validateFuncs = Object.values(this._registeredValidateFunctions).filter(t => t)
    for (let i = 0; i < validateFuncs.length; i++) {
      if (Array.isArray(validateFuncs[i])) {
        for (let j = 0; j < validateFuncs[i].length; j++) {
          isError = validateFuncs[i][j]?.(this._formValues)
        }
        if (isError) {
          break
        }
      }
      if (isError) {
        break
      }
    }

    if (!isError) {
      this._onSubmit?.(this._formValues, {
        setFieldMeta: this.setFieldMeta,
      })
    } else {
      this._onSubmitFailed?.()
    }

    Object.values(this._registeredChangeMetaFunctions).forEach(setMetaArray => setMetaArray.forEach(setMeta => setMeta({submitted: true})))
  }
}
/*HELPERS*/

const useForce = () => {
  const [value, setValue] = useState(true) // integer state
  return () => setValue(!value) // update the state to force render
}

type ObjectSetParams = {
  obj: {[K: string]: any}
  path: string
  value: any
}
const objectSet = ({path, obj, value}: ObjectSetParams) => {
  const pathSplit = pathParse({path})
  let remakeObj: any
  for (let i = 0; i < pathSplit.length; i++) {
    let pathSplitItem = pathSplit[i]
    if (typeof pathSplitItem === 'string') {
      if (i === pathSplit.length - 1) {
        if (i === 0) {
          obj[pathSplitItem] = value
        } else {
          remakeObj[pathSplitItem] = value
        }
      } else {
        if (i === 0) {
          if (obj[pathSplitItem] === undefined) {
            obj[pathSplitItem] = {}
          }
          remakeObj = obj[pathSplitItem]
        } else {
          if (remakeObj[pathSplitItem] === undefined) {
            remakeObj[pathSplitItem] = {}
          }
          remakeObj = remakeObj[pathSplitItem]
        }
      }
    } else {
      if (i === pathSplit.length - 1) {
        if (i === 0) {
          // let
          if (obj[pathSplitItem.array] === undefined) {
            obj[pathSplitItem.array] = []
            obj[pathSplitItem.array][pathSplitItem.index] = value
          } else {
            obj[pathSplitItem.array][pathSplitItem.index] = value
          }
        } else {
          if (remakeObj[pathSplitItem.array] === undefined) {
            remakeObj[pathSplitItem.array] = []
          }
          remakeObj[pathSplitItem.array][pathSplitItem.index] = value
        }
      } else {
        if (i === 0) {
          if (obj[pathSplitItem.array] === undefined) {
            obj[pathSplitItem.array] = []
          }
          if (obj[pathSplitItem.array][pathSplitItem.index] !== undefined) {
            remakeObj = obj[pathSplitItem.array][pathSplitItem.index]
          } else {
            obj[pathSplitItem.array][pathSplitItem.index] = {}
            remakeObj = obj[pathSplitItem.array][pathSplitItem.index]
          }
        } else {
          if (remakeObj[pathSplitItem.array] === undefined) {
            remakeObj[pathSplitItem.array] = []
          }
          if (remakeObj[pathSplitItem.array][pathSplitItem.index] !== undefined) {
            remakeObj = remakeObj[pathSplitItem.array][pathSplitItem.index]
          } else {
            remakeObj[pathSplitItem.array][pathSplitItem.index] = {}
            remakeObj = remakeObj[pathSplitItem.array][pathSplitItem.index]
          }
        }
      }
    }
  }
  return obj
}

type ObjectGetParams = {
  path: string
  obj: {[K: string]: any}
}
const objectGet = ({obj, path}: ObjectGetParams) => {
  const pathSplit = pathParse({path}) // парсер атрибута "name"
  let remakeObj: any
  for (let i = 0; i < pathSplit.length; i++) {
    // перебор распаршенного атрибута "name"
    let pathSplitItem = pathSplit[i]
    if (typeof pathSplitItem === 'string') {
      // Если не массив
      if (i === pathSplit.length - 1) {
        // если последний
        if (i === 0) {
          // если один элемент всего
          if (obj[pathSplitItem] !== undefined) {
            remakeObj = obj[pathSplitItem]
          } else {
            remakeObj = undefined
          }
        } else {
          // логика для последнего
          if (remakeObj !== undefined && remakeObj !== null && remakeObj[pathSplitItem] !== undefined) {
            remakeObj = remakeObj[pathSplitItem]
          } else {
            remakeObj = undefined
          }
        }
      } else {
        // Если не последний
        if (i === 0) {
          // если первый
          if (obj[pathSplitItem] !== undefined) {
            remakeObj = obj[pathSplitItem]
          } else {
            remakeObj = undefined
          }
        } else {
          // если не первый
          if (remakeObj !== undefined && remakeObj !== null && remakeObj[pathSplitItem] !== undefined) {
            remakeObj = remakeObj[pathSplitItem]
          } else {
            remakeObj = undefined
          }
        }
      }
    } else {
      // если массив
      if (i === pathSplit.length - 1) {
        // Если последний
        if (i === 0) {
          // Если единственный
          if (obj[pathSplitItem.array] !== undefined && obj[pathSplitItem.array][pathSplitItem.index] !== undefined) {
            remakeObj = obj[pathSplitItem.array][pathSplitItem.index]
          } else {
            remakeObj = undefined
          }
        } else {
          // Если не первый
          if (
            remakeObj !== undefined &&
            remakeObj !== null &&
            remakeObj[pathSplitItem.array] !== undefined &&
            remakeObj[pathSplitItem.array] !== null &&
            remakeObj[pathSplitItem.array][pathSplitItem.index] !== undefined
          ) {
            remakeObj = remakeObj[pathSplitItem.array][pathSplitItem.index]
          } else {
            remakeObj = undefined
          }
        }
      } else {
        // Если не последний
        if (i === 0) {
          // Если первый
          if (obj[pathSplitItem.array] !== undefined && obj[pathSplitItem.array][pathSplitItem.index] !== undefined) {
            remakeObj = obj[pathSplitItem.array][pathSplitItem.index]
          } else {
            remakeObj = undefined
          }
        } else {
          // Если не первый
          if (
            remakeObj !== undefined &&
            remakeObj !== null &&
            remakeObj[pathSplitItem.array] !== undefined &&
            remakeObj[pathSplitItem.array] !== null &&
            remakeObj[pathSplitItem.array][pathSplitItem.index] !== undefined
          ) {
            remakeObj = remakeObj[pathSplitItem.array][pathSplitItem.index]
          } else {
            remakeObj = undefined
          }
        }
      }
    }
  }
  return remakeObj
}

type ObjectParseParams = {
  path: string
}
type PathSplitType = (string | {array: string; index: number})[]
const pathParse = (params: ObjectParseParams): PathSplitType => {
  let pathSplitByObj = params.path.split('.')
  const pathSplit: PathSplitType = pathSplitByObj.map(path => {
    if (path.indexOf('[') !== -1) {
      const arrName = path.substr(0, path.indexOf('['))
      let indexOfLeftBracket = path.indexOf('[') + 1
      let length = path.indexOf(']') + 1 - indexOfLeftBracket
      const index = path.substr(indexOfLeftBracket, length)
      return {
        array: arrName,
        index: parseInt(index),
      }
    } else {
      return path
    }
  })
  return pathSplit
}

//
// <FormFieldWrapper name={'users[2].name'}>
// ///
// <FormFieldWrapper/>
//
// input
