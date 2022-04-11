import React, { DetailedHTMLProps, FC, InputHTMLAttributes, useEffect, useState } from "react";
import {useCreateForm} from 'cherlin-form'


// const {initialize, Form} = CherlinForm.useCreateForm<FormData>()

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
*     <Field name={string} render={(props: FieldProps) => ReactNode} validate/>
*
* </Form>
*
*  */

const App = () => {
  const [set, ss ] = useState(false)

  const {Field, formValuesStore, formErrorsStore, WithFieldValue, submit, formHelpers} = useCreateForm<{test: {
      name: string
    }[]}>({
    initialValues: {
      test: []
    },
    onSubmitSuccess: console.log,
    onSubmitError: console.log,
  })

  useEffect(() => {
    // formHelpers.change('test', {
    //   name: '555'
    // })
  },[formHelpers])
  // const logStore = () => {
  //   console.log(formValuesStore.getFormValues())
  //   console.log(formErrorsStore.getFormErrors())
  // }
  console.log('rerender')
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
      <h1>Тестирование формы</h1>
      <button onClick={() => ss(!set)}>rerender</button>
      {/* <Field name={'test[0].name'} render={Test}/> */}
      <Field name={'test2'} render={props => {
        console.log('test2')
        return <><input value={props.field.value ?? ''} onChange={e => props.field.setValue(e.target.value as string)}/>{!!props.meta.error && props.meta.touched && `Error: ${props.meta.error}`}</>
      }}/>
      <WithFieldValue<any, string> fieldName={"test"} render={({field}) => {

        return <ul>
          {
            field.value?.map((test:any, index: number) => <li><Field name={`${field.fieldName}[${index}].name`} render={Test}/></li>)
          }
          <li>
            <button onClick={() => formHelpers.change(field.fieldName, [
              ...field.value,
              ...([1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,].map( r => ({
                name: ''
              })))
            ])}>add row</button>
          </li>
        </ul>
      }}/>
      <button onClick={submit}>log store</button>
    </div>
  )
}

export default App

const Test =(props: any) => {
  console.log('test1')
  return <><input value={props.field.value ?? ''} onChange={e => props.field.setValue(e.target.value as string)}/>{!!props.meta.error && props.meta.touched && `Error: ${props.meta.error}`}</>
}


// type InputProps = Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'value'> & {
//   onTextChange: (value: string) => void
//   value: string|null
// }
// const Input: FC<InputProps> = props => {
//   return <input type='text' onChange={e => props.onTextChange(e.target.value)} value={props.value ?? ''}/>
// }
