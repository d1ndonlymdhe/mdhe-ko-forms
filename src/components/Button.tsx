import { PropsWithChildren } from "react";
type buttonProps = {
    id?: string,
    type?: "submit" | "button" | "reset"
    ,
    className?: string
    onClick?: () => void
}
const Button = (props: PropsWithChildren<buttonProps>) => {
    const { id, type, className, onClick } = props;
    return <button type={type} id={id || ""} className={`px-2 py-1 bg-violet-700 font-bold text-white rounded-md hover:scale-110 duration-100 ${className}`} onClick={(e) => {
        e.stopPropagation();
        if (onClick) {
            onClick()
        }
    }}>{props.children}</button>
}

export default Button