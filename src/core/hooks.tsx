import { useState } from 'react'

/*
 * Возвращает функцию, при вызове которой, ререндерит элемент
 * */
export const useForce = () => {
  const [value, setValue] = useState(true) // integer state
  return () => setValue(!value) // update the state to force render
}
