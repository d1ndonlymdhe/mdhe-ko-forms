import { GetServerSideProps } from "next";
import { PrismaClient } from "@prisma/client";
import { ArrowTopRightOnSquareIcon, Bars3Icon, LinkIcon, PencilIcon, PlusIcon, TableCellsIcon, TrashIcon, UserCircleIcon } from "@heroicons/react/24/solid"
import Button from "../../components/Button";
import Link from "next/link"
import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie"
import userFromToken from "../../utils/userFromToken";
// import { formEl } from "./newform";
import Head from "next/head";
import uuid from "react-uuid";
import ModalWithBackdrop from "../../components/ModelWithBackdrop";
import { trpc } from "../../utils/trpc";
import Papa from "papaparse";
export type value = {
    value: string
}

export type formEl = {
    type: string,
    name: string,
    label: string,
    default?: string,
    required?: boolean
    elOptions: {
        option: string
    }[],
    values: value[]
}
export type form = {
    title: string,
    description: string,
    elements: formEl[],
    id: string,
    entries: number
}

type PageProps = {
    username: string
    forms?: form[]
}

export default function Dashboard(pageProps: PageProps) {
    const { username, forms: propsForms } = pageProps
    const [forms, setForms] = useState(propsForms)
    useEffect(() => {
        const token = Cookies.get("token")
        if (token) {
            Cookies.set("token", token, { expires: 30 })
        }
    })
    return <>
        <Head>
            <title>
                {"Mdhe Ko Forms : " + username}
            </title>
        </Head>
        <div className="grid grid-rows-[1fr_9fr] h-screen w-screen">
            <TopBar></TopBar>

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
                                            <FormControls {...{ username, formId: form.id, form, forms, setForms }}></FormControls>
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

type FormControlsProps = {
    username: string,
    formId: string,
    form: form,
    forms: form[],
    setForms: React.Dispatch<React.SetStateAction<form[] | undefined>>
}
function FormControls(props: FormControlsProps) {
    const { username, formId, form, forms, setForms } = props;
    const [deleteWarning, setDeleteWarning] = useState(false)
    const parentRef = useRef<HTMLDivElement>(null)
    const [csvURL, setCsvURL] = useState("")
    const formDeleteMutation = trpc.form.deleteForm.useMutation({
        onSuccess: (data) => {
            if (data.status == "success") {
                const tempForms = removeFromArr(form, forms);
                setForms(tempForms)
            }
        }
    })
    useEffect(() => {
        if (form) {
            const names: string[] = []
            const data: string[][] = []
            const elements = form.elements
            elements.forEach(element => {
                names.push(element.name);
                const values: string[] = []
                element.values.forEach(value => {
                    values.push(JSON.parse(value.value))
                })
                data.push(values)
            })
            const csvString = Papa.unparse({ fields: names, data: transpose(data) })
            const blob = new Blob([csvString], { type: "text/csv" })
            const url = URL.createObjectURL(blob)
            console.log("url = ", url)
            setCsvURL(url)
        }
    }, [])
    return <>
        {
            deleteWarning &&
            <ModalWithBackdrop onClick={() => {
                setDeleteWarning(false)
            }} title="Are You sure you want to delete the form?">
                <div className="grid grid-flow-row gap-y-2 justify-center">
                    {
                        csvURL !== "" &&
                        <a href={csvURL} download="result.csv" className="w-full">
                            <Button className="bg-amber-400" >
                                Download Data
                            </Button>
                        </a>
                    }
                    <Button className="bg-green-400" onClick={() => {
                        if (!formDeleteMutation.isLoading) {
                            setDeleteWarning(false)
                        }
                    }}>
                        {!formDeleteMutation.isLoading && "Cancel" || "Loading"}
                    </Button>
                    <Button className="bg-red-400" onClick={() => {
                        if (!formDeleteMutation.isLoading) {
                            formDeleteMutation.mutate({ formId: formId })
                        }
                    }}>
                        {!formDeleteMutation.isLoading && "Delete Form" || (formDeleteMutation.isSuccess && "Deleted" || "Loading")}
                    </Button>
                </div>
            </ModalWithBackdrop>}
        <div ref={parentRef} className="formActions grid grid-flow-col gap-x-2 px-4 py-2 bg-slate-600 rounded-b-md ">
            <Link href={`./${username}/${formId}/edit`}><a target="_blank"><Button expand={true} className="group group-hover:scale-75 grid justify-center px-5 py-2"><PencilIcon className="h-10 w-10"></PencilIcon></Button></a></Link>
            <Link href={`./${username}/${formId}`}><a target={"_blank"}><Button expand={true} className="group group-hover:scale-75 grid justify-center px-5 py-2"><ArrowTopRightOnSquareIcon className="h-10 w-10"></ArrowTopRightOnSquareIcon></Button></a></Link>
            <Button onClick={() => {
                setDeleteWarning(true)
            }} expand={true} className="group group-hover:scale-75 grid justify-center px-5 py-2"><TrashIcon className="h-10 w-10"></TrashIcon></Button>
            <Link href={`./${username}/result/${formId}`}><a target="_blank"><Button expand={true} className="group group-hover:scale-75 grid justify-center px-5 py-2"><TableCellsIcon className="h-10 w-10"></TableCellsIcon></Button></a></Link>
        </div></>
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
    if (context.params) {
        const { username: reqUsername } = context.params
        const user = await userFromToken(token)
        if (user && user.username === reqUsername) {
            const forms = await prisma.form.findMany({
                where: { ownerId: user.id }, include: {
                    elements: {
                        include: {
                            values: true
                        }
                    }
                }
            })
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
    }
    return {
        redirect: {
            permanent: false,
            destination: "/"
        }
    }
}
function removeFromArr<T>(el: T, arr: T[]) {
    const retArr: T[] = []
    let indexOfEl = -1;
    for (let i = 0; i < arr.length; i++) {
        if (JSON.stringify(el) === JSON.stringify(arr[i])) {
            indexOfEl = i;
            break;
        }
    }
    if (indexOfEl !== -1) {
        for (let i = 0; i < arr.length; i++) {
            if (i !== indexOfEl) {
                const a = arr[i];
                if (a) {
                    retArr.push(a)
                }
            }
        }
        return retArr;
    }
    return arr;
}
function transpose<T>(arr: T[][]) {
    const retArr: T[][] = [];
    const A = arr[0]
    if (A) {
        for (let i = 0; i < A.length; i++) {
            const tempArr: T[] = []
            for (let j = 0; j < arr.length; j++) {
                const B = arr[j]
                if (B) {
                    const C = B[i]
                    if (C) {
                        tempArr.push(C)
                    }
                }
            }
            retArr.push(tempArr)
        }
    }
    return retArr
}