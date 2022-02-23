import {
  AnyObject,
  FormConstructorParams,
  IForm,
  OnSubmit
} from '../Types/Form'

class Form<FormData extends any> implements IForm {
  private _formValues: any = {}
  private _onSubmit: OnSubmit<FormData>
  constructor(params: FormConstructorParams<FormData>) {
    if (params.initialData) {
      this._initializeForm(params.initialData)
    }
    this._onSubmit = params.onSubmit
  }

  private _initializeForm = (initialValue: FormData) => {
    this._formValues = initialValue
  }
}
export default Form
