import { Bars3Icon, UserCircleIcon } from "@heroicons/react/24/solid";

export default function TopBar() {
    return <header className="bg-purple-600 text-white flex items-center justify-between px-4 py-2">
        <Bars3Icon className="w-10 h-10 hover:cursor-pointer" ></Bars3Icon>
        <span className="text-3xl font-extrabold leading-normal text-gray-700 lg:text-5xl md:text-5xl sm:text-5xl ">
            Mdhe <span className="text-purple-300">Ko</span> Forms
        </span>
        <UserCircleIcon className="w-10 h-10 hover:cursor-pointer"></UserCircleIcon>
    </header>
}
