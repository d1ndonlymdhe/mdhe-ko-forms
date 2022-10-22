import { GetServerSideProps } from "next";
import { PrismaClient } from "@prisma/client";
import { Bars3Icon, LinkIcon, PencilIcon, PlusIcon, TableCellsIcon, TrashIcon, UserCircleIcon } from "@heroicons/react/24/solid"
import Button from "../../components/Button";
import Link from "next/link"
import { useEffect, useRef } from "react";
import Cookies from "js-cookie"
import userFromToken from "../../utils/userFromToken";
import { formEl } from "./newform";
import Head from "next/head";
import uuid from "react-uuid";
type form = {
    title: string,
    description: string,
    elements: formEl[]
}

type PageProps = {
    username: string
    forms?: form[]
}

export default function Dashboard(pageProps: PageProps) {
    const { username, forms } = pageProps
    useEffect(() => {
        Cookies.set("token", Cookies.get("token")!, { expires: 30 })
    })
    return <>
        <Head>
            <title>
                {"Mdhe Ko Forms : " + username}
            </title>
        </Head>
        <div className="grid grid-rows-[1fr_9fr] h-screen w-screen">
            <TopBar></TopBar>
            {/* <div className="text-center text-5xl font-bold text-slate-500 opacity-60 mt-2 mx-2">
                {`Welcome ${username} what will you create today?`}
            </div> */}
            <div className="grid grid-flow-rows items-center gap-2">
                <div className="text-center lg:text-9xl text-5xl font-bold text-slate-500">
                    Your Forms:
                </div>
                <div className="flex flex-col gap-2 mt-2 mx-2">
                    <div id="listForms h-fit">
                        <div>
                            {
                                forms &&
                                <div className="grid sm:grid-flow-col grid-flow-row gap-5 justify-center">
                                    {forms.map(form => {
                                        return <div className="h-fit bg-purple-400 pt-1 grid gap-2 rounded-md" key={uuid()}>
                                            <div className="px-2 text-white">
                                                <p className="text-5xl font-bold px-4 py-2">{form.title}</p>
                                                <p className="text-3xl px-4 py-2">{form.description}</p>
                                            </div>
                                            <FormControls></FormControls>
                                        </div>
                                    })}
                                    <div className="h-fit bg-purple-400 pt-1 grid gap-2 rounded-md">
                                        <div className="px-2 text-white">
                                            <p className="text-5xl font-bold px-4 py-2 hover:cursor-pointer">Create a new form</p>
                                            <p className="text-3xl px-4 py-2">Click here</p>
                                        </div>
                                        <div className="formActions grid grid-flow-col peer gap-x-2 px-4 py-2 bg-slate-600 rounded-b-md ">
                                            <Link href={`./${username}/newform`}>
                                                <a target={"_blank"}>
                                                    <div className="grid grid-flow-col">
                                                        <Button expand={true} className="group hover:py-3 px-5 py-2 w-fit">
                                                            <PlusIcon className="group-hover:hidden w-10 h-10"></PlusIcon>
                                                            <div className="group-hover:block hidden text-xl">Create Form</div>
                                                        </Button>
                                                    </div>
                                                </a>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                ||
                                <div className="h-fit bg-purple-400 pt-1 grid gap-2 rounded-md">
                                    <div className="px-2 text-white">
                                        <p className="text-5xl font-bold px-4 py-2">You have no forms</p>
                                        <p className="text-3xl px-4 py-2">Create a form now</p>
                                    </div>
                                    <div className="formActions grid grid-flow-col gap-x-2 px-4 py-2 bg-slate-600 rounded-b-md ">
                                            <Link href={`./${username}/newform`}>
                                                <a target={"_blank"}>
                                                    <Button className="px-5 py-2">
                                                        <PlusIcon className="w-10 h-10"></PlusIcon>
                                                    </Button>
                                                </a>
                                            </Link>
                                        </div>
                                    </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
}


function FormControls() {
    const parentRef = useRef<HTMLDivElement>(null)
    return <div ref={parentRef} className="formActions grid grid-flow-col gap-x-2 px-4 py-2 bg-slate-600 rounded-b-md ">
        <Button expand={true} className="group group-hover:scale-75 grid justify-center px-5 py-2"><PencilIcon className="h-10 w-10"></PencilIcon></Button>
        <Button expand={true} className="group group-hover:scale-75 grid justify-center px-5 py-2"><LinkIcon className="h-10 w-10"></LinkIcon></Button>
        <Button expand={true} className="group group-hover:scale-75 grid justify-center px-5 py-2"><TrashIcon className="h-10 w-10"></TrashIcon></Button>
        <Button expand={true} className="group group-hover:scale-75 grid justify-center px-5 py-2"><TableCellsIcon className="h-10 w-10"></TableCellsIcon></Button>
    </div>
}


function TopBar() {
    return <header className="bg-purple-600 text-white flex items-center justify-between px-4 py-2">
        <Bars3Icon className="w-10 h-10 hover:cursor-pointer" ></Bars3Icon>
        <span className="text-3xl font-extrabold leading-normal text-gray-700 lg:text-5xl md:text-5xl sm:text-5xl ">
            Mdhe <span className="text-purple-300">Ko</span> Forms
        </span>
        <UserCircleIcon className="w-10 h-10 hover:cursor-pointer"></UserCircleIcon>
    </header>
}

export const getServerSideProps: GetServerSideProps<any, { username: string }> = async (context) => {
    const token = context.req.cookies.token
    const prisma = new PrismaClient()
    const { username: reqUsername } = context.params!
    const user = await userFromToken(token)
    if (user && user.username === reqUsername) {
        const forms = await prisma.form.findMany({ where: { ownerId: user.id } })
        if (forms) {
            return {
                props: {
                    username: user.username,
                    forms: forms
                }
            }
        }
        return {
            props: {
                usernmae: user.username
            }
        }
    } else {
        return {
            redirect: {
                permanent: false,
                destination: "/"
            }
        }
    }
    // if (token) {
    //     const tokenInfo = await prisma.userToken.findFirst({ where: { value: token } })
    //     if (tokenInfo) {
    //         const user = await prisma.user.findFirst({ where: { id: tokenInfo.userId } });
    //         const forms = await prisma.form.findMany({ where: { ownerId: user?.id } })
    //         if (user?.username == reqUsername) {
    //             return {
    //                 props: {
    //                     username: user.username
    //                 }
    //             }
    //         } else {
    //             return {
    //                 redirect: {
    //                     permanent: false,
    //                     destination: "/"
    //                 }
    //             }
    //         }
    //     } else {
    //         return {
    //             redirect: {
    //                 permanent: false,
    //                 destination: "/"
    //             }
    //         }
    //     }
    // } else {
    //     return {
    //         redirect: {
    //             permanent: false,
    //             destination: "/"
    //         }
    //     }
    // }
}