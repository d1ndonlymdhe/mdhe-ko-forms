import { forwardRef } from "react";
type InputProps = {
    type: string,
    name: string,
    id: string,
    minLength?: number,
    className?: string
    required?: boolean
}
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const { type, id, minLength, className, name, required } = props;
    return <input ref={ref} type={type} id={id} minLength={minLength || 0} className={`px-2 py-2 active:scale-110 focus:scale-110 hover:scale-110 border-2 border-solid border-gray-300 duration-100 rounded-md focus:outline-none focus:border-4 focus:border-purple-300  ${className}`} required={required ? true : false}></input>
})

export default Input;