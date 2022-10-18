import { PropsWithChildren } from "react";
type ErrorProps = {
    className?: string
}
const Error = (props: PropsWithChildren<ErrorProps>) => {
    const { className } = props;
    return <div className={`bg-red-500 font-bold text-white rounded-md text-center px-2 py-1 ${className}`}>{props.children}</div>
}
export default Error