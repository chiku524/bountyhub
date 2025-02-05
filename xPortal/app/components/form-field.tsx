// app/components/form-field.tsx
import { useEffect, useState } from "react"

interface FormFieldProps {
    textarea: boolean
    htmlFor: string
    label: string
    type?: string
    value: any
    onChange?: (...args: any) => any,
    error?: string
    onClick?: (...args: any) => any
  }
  
  export function FormField({ textarea, htmlFor, label, type = 'text', value, onChange = () => {}, error = "", onClick = () => {} }: FormFieldProps) {
    const [errorText, setErrorText] = useState(error);

    useEffect(() => {
        setErrorText(error)
    }, [error])

    return (
      <>
        <label htmlFor={htmlFor} className="text-blue-600 font-semibold">
          {label}
        </label>
        {textarea ? <textarea rows={4} cols={50} onChange={e => {onChange(e); setErrorText('')}} id={htmlFor} name={htmlFor} className='w-full p-2 rounded-xl my-2' value={value} onClick={() => onClick()}>

        </textarea> :
        <input 
          onChange={e => {
            onChange(e)
            setErrorText('')
        }} type={type} id={htmlFor} name={htmlFor} className='w-full p-2 rounded-xl my-2' value={value} onClick={() => onClick()}/>}
        <div className="text-xs font-semibold text-center tracking-wide text-red-500 w-full">
            {errorText || ''}
        </div>
      </>
    )
  }
  