import { PropsWithChildren } from "react"

type WrapperProps = {
    className?: string
    id?: string
}
export default function Wrapper(props: PropsWithChildren<WrapperProps>) {
    return <div className={`grid grid-flow-row bg-purple-500 rounded-lg text-lg text-white sm:py-4 sm:px-8 py-2 px-2 h-fit ${props.className}`} id={props.id || ""}>
        {props.children}
    </div >
}