import React, {DetailedHTMLProps, FC, InputHTMLAttributes} from 'react'

// const {initialize, Form} = CherlinForm.createForm<FormData>()

/*
* types
* FormData extends AnyObject
* FieldProps<Value extends any, ErrorType extends any> {
*   field: {
*     value: Value
*   }
* }
*
*  */

/*
* <Form
*   initialValues?={FormData}
*   onSubmit={(formData: FormData, formHelpers)=>}
*   formComponent={FC || 'form'} // default is ReactFragment
* >
*
* <Field name={string} render={(props: FieldProps) => ReactNode} validate/>
*
* </Form>
*
*  */

const App = () => {
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
      <h1>Тестирование формы</h1>
    </div>
  )
}

export default App

// type InputProps = Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'value'> & {
//   onTextChange: (value: string) => void
//   value: string|null
// }
// const Input: FC<InputProps> = props => {
//   return <input type='text' onChange={e => props.onTextChange(e.target.value)} value={props.value ?? ''}/>
// }
