// app/components/form-field.tsx

interface FormFieldProps {
    textarea: boolean
    htmlFor: string
    label: string
    type?: string
    value: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    error?: string
    onClick?: () => void
    autocomplete?: string
  }
  
  export function FormField({ textarea, htmlFor, label, type = 'text', value, onChange = () => {}, error = "", onClick = () => {}, autocomplete }: FormFieldProps) {
    return (
      <>
        <label htmlFor={htmlFor} className="text-blue-600 font-semibold">
          {label}
        </label>
        {textarea ? <textarea rows={4} cols={50} onChange={e => onChange(e)} id={htmlFor} name={htmlFor} className='w-full p-2 rounded-xl my-2' value={value} onClick={() => onClick()}>
        </textarea> :
        <input 
          onChange={e => onChange(e)} 
          type={type} 
          id={htmlFor} 
          name={htmlFor} 
          className='w-full p-2 rounded-xl my-2' 
          value={value} 
          onClick={() => onClick()}
          autoComplete={autocomplete}
        />}
        <div className="text-xs font-semibold text-center tracking-wide text-red-500 w-full">
            {error || ''}
        </div>
      </>
    )
  }
  