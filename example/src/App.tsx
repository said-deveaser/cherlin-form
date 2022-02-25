import React, {DetailedHTMLProps, FC, InputHTMLAttributes} from 'react'
import {useCreateForm} from 'cherlin-form'

type FormData = {}

const App = () => {
  const {Field, submit} = useCreateForm<FormData>({
    onSubmit: data => {},
    initialData: {},
  })
  return (
    <div>
      <h1>Тестирование формы</h1>
      {/* <Field name={''}  > */}
      {/*   {()=>( */}
      {/*     <Input/> */}
      {/*   )} */}
      {/* </Field> */}
      {/* <Field name={'test'}>{}</Field> */}
    </div>
  )
}

export default App

type InputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
  onTextChange: (value: string) => void
}
const Input: FC<InputProps> = props => {
  return <input type='text' onChange={e => props.onTextChange(e.target.value)} />
}
