import { PropsWithChildren } from "react";

type ModalWithBackdropProps = {
    onClick?: () => void,
    title: string,
    className?: string,
}

export default function ModalWithBackdrop(props: PropsWithChildren<ModalWithBackdropProps>) {
    const { onClick, title, className } = props;
    return <div className="absolute h-screen w-screen left-0 top-0 z-[100]  0 flex justify-center items-center backdrop-blur-sm" onClick={() => { onClick && onClick() }}>
        <div className={`bg-gray-400 max-w-[300px] flex flex-col justify-center items-center px-2 pb-2 rounded-md border-2 border-black ${className}`} onClick={(e) => { e.stopPropagation() }}>
            <div className="flex flex-col my-2 w-full">
                <div className="text-center text-xl border-b-2 border-black mb-2 w-[98%]">{title}</div>
                {
                    props.children
                }
            </div>
        </div>
    </div>
}