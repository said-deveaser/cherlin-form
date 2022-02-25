import React, {DetailedHTMLProps, FC, InputHTMLAttributes} from 'react'
import {useCreateForm} from 'cherlin-form'

type FormData = {
  employee: string| null
  director: string| null
}

const App = () => {
  const {Field, submit} = useCreateForm<FormData>({
    onSubmit: data => {
      console.log('data', data)
    },
  })
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
      <h1>Тестирование формы</h1>
      <Field<string> name={'employee'} validate={(value, formValues) => {
        if (value?.includes('000')) {
          return "value cannot icnlude 000"
        }
        return undefined
      }} >
        {({field, meta})=>(
          <>
            <Input onTextChange={field.onValueChange} value={field.value}/>
            {meta.error}
          </>
        )}
      </Field>
      <Field<string> name={'director'} validate={(value, formData) => {
        if (value?.includes('000')) {
          return "value cannot icnlude 000"
        }
        return undefined
      }} >
        {({field, meta})=> {
          console.log('rerender')
          return (
            <>
              <Input onTextChange={field.onValueChange} value={field.value} />
              {meta.error}
            </>
          );
        }}
      </Field>
      <button onClick={() => submit()}>SUBMIT</button>
      {/* <Field name={'test'}>{}</Field> */}
    </div>
  )
}

export default App

type InputProps = Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'value'> & {
  onTextChange: (value: string) => void
  value: string|null
}
const Input: FC<InputProps> = props => {
  return <input type='text' onChange={e => props.onTextChange(e.target.value)} value={props.value ?? ''}/>
}
