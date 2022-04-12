import React, {DetailedHTMLProps, FC, InputHTMLAttributes, useCallback, useEffect, useState} from "react"
import {useCreateForm} from 'cherlin-form'

type AppFormData = {
  employee: {
    name: string
  }
}

const App = () => {
  const [set, ss ] = useState(false)
  console.log('rerender')
  const {Field, WithFieldValue, submit, formHelpers} = useCreateForm<AppFormData>({
    onSubmitSuccess: console.log,
    onSubmitError: console.log,
  })

  const [v,vv] = useState('')
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
      <h1>Тестирование формы</h1>

      <Field name={"employee.name"} validate={(value) => {
        return undefined
      }} render={({field}) => {
        return <input value={field.value} name={field.fieldName} onChange={e => field.setValue(e.target.value)}/>
      }}/>
      <Field props={{v}} name={"employee.surname"} validate={(value) => {
        return undefined
      }} render={({field}) => {
        return <div><input value={field.value} name={field.fieldName} onChange={e => {
          vv(e.target.value)
          field.setValue(e.target.value)
        }}/>{field.props?.v}</div>
      }}/>
      <WithFieldValue<{name: string}[]> fieldName={"users"} render={({field}) => {
        console.log('rerender')
        return <div>
          {field.value?.map((item, i) => {
            return (<div key={i}>
              <Field name={`${field.fieldName}[${i}].name`} render={({field}) => {
                console.log('rerender field')
                return <input name={field.fieldName} value={field.value} onChange={e => field.setValue(e.target.value)}/>
              }}/>
              <hr/>
            </div>)
          })}
          <button type={'button'} onClick={e => {
            let newValue = []
            if (!Array.isArray(field.value)) {
              newValue = [{name: ''}]
            } else {
              newValue = [...field.value, {name: ''}]
            }
            formHelpers.change(field.fieldName, newValue)
          }}>Add row</button>
          <hr/>
        </div>
      }}/>

      <button onClick={() => ss(!set)}>rerender</button>
      <button onClick={submit}>log store</button>
    </div>
  )
}

export default App

// const Test =(props: any) => {
//   console.log('test1')
//   return <><input value={props.field.value ?? ''} onChange={e => props.field.setValue(e.target.value as string)}/>{!!props.meta.error && props.meta.touched && `Error: ${props.meta.error}`}</>
// }


// type InputProps = Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'value'> & {
//   onTextChange: (value: string) => void
//   value: string|null
// }
// const Input: FC<InputProps> = props => {
//   return <input type='text' onChange={e => props.onTextChange(e.target.value)} value={props.value ?? ''}/>
// }
