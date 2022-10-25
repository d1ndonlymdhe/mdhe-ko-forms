import { ChangeEvent, forwardRef } from "react";
type InputProps = {
    type: string,
    name?: string,
    id?: string,
    minLength?: number,
    className?: string
    required?: boolean
    value?: string
    defaultValue?: string
    expand?: boolean
    readonly?: boolean
    autoComplete?: "off" | "on";
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void
}
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const { type, id, minLength, className, name, required, value, onChange, defaultValue, expand, autoComplete, readonly } = props;
    return <input ref={ref} name={name || ""} value={value} type={type} id={id || ""} onChange={(e) => {
        if (onChange != undefined) {
            onChange(e)
        }
    }} minLength={minLength || 0} readOnly={readonly} defaultValue={defaultValue} autoComplete={autoComplete || "off"} className={`px-2 py-2 ${expand && "active:scale-110 focus:scale-110 hover:scale-110"} text-black  border-2 border-solid border-gray-300 duration-100 rounded-md focus:outline-none focus:border-4 focus:border-purple-300  ${className}`} required={required ? true : false}></input>
})
Input.displayName = "Input"

export default Input;