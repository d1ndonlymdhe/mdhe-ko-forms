import { PrismaClient } from "@prisma/client"
import { GetServerSideProps } from "next"
import React, { useEffect, useRef, useState } from "react";
import Button from "../../../components/Button";
import TopBar from "../../../components/Topbar";
import uuid from "react-uuid"
import Input from "../../../components/Input";

type set<T> = React.Dispatch<React.SetStateAction<T>>

type pageProps = {
    username: string
}
type formEl = {
    type: "Text" | "Radio" | "Checkbox" | "Dropdown",
    options: formElOptions
}
type formElOptions = {
    name: string,
    label: string,
    radioOptions?: string[]
    dropdownOptions?: string[]
    checkboxoptions?: string[]
    default?: string
    required?: boolean
}

export default function FormMaker(props: pageProps) {
    const { username } = props;
    const [formState, setFormState] = useState<formEl[]>([])
    const [formTitle, setFormTitle] = useState("Untitled Form")
    const [formDescription, setFormDescription] = useState("Undescribed Form")
    const FormTitleRef = useRef<HTMLInputElement>(null)
    const FormDescriptionRef = useRef<HTMLInputElement>(null)
    return <>
        <TopBar></TopBar>
        <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-2 grid-rows-2">
            <div id="form_designer" className="grid grid-flow-row px-2 py-1 text-lg">
                <div id="formDescription" className="grid grid-flow-row bg-purple-500 my-2 mx-2 rounded-lg text-lg text-white py-2 px-2">
                    <label htmlFor="formTitle">Title:</label>
                    <Input id="formTitle" type="text" onChange={(e) => {
                        setFormTitle(FormTitleRef.current?.value!)
                    }
                    } ref={FormTitleRef} className="hover:scale-100 focus:scale-100 active:scale-100"></Input>
                    <label htmlFor="formDescription">Description:</label>
                    <Input id="formDescription" type="text" onChange={(e) => {
                        setFormDescription(FormDescriptionRef.current?.value!)
                    }
                    } ref={FormDescriptionRef} className="hover:scale-100 focus:scale-100 active:scale-100"></Input>
                </div>
                <div className="mt-2">
                    <AddFromElement {...{ setFormState, formState }}></AddFromElement>
                </div>
            </div>
            <FormDemo {...{ formState, formTitle, formDescription }}></FormDemo>

        </div>
    </>
}

type AddFromElementProps = {
    formState: formEl[]
    setFormState: set<formEl[]>
}
function AddFromElement(props: AddFromElementProps) {
    const { formState, setFormState } = props
    const [currentSelection, setCurrentSelection] = useState<"Text" | "Radio" | "Dropdown" | "Checkbox">("Text");
    //@ts-ignore
    const [elementOptions, setElementOptions] = useState<formElOptions>({ label: "Add a label", name: "random_name", checkboxoptions: [], default: "", dropdownOptions: [], radioOptions: [], required: false })
    return <div className="grid">
        <form className="grid grid-flow-row gap-2 bg-purple-500 my-2 mx-2 rounded-lg text-sm text-white px-2 py-2" onSubmit={(e) => {
            e.preventDefault()
            setFormState([...formState, { type: currentSelection, options: elementOptions }])
        }}>
            <label htmlFor="elementType">Select Element Type To Add: </label>
            <select id="elementType" className="px-2 py-1 bg-pink-500 text-white rounded-md" onChange={(e) => {
                //@ts-ignore
                setCurrentSelection(e.target.value!)
                console.log(e.target.value)
            }} defaultValue="Text">
                <option className="" value={"Text"}>Text</option>
                <option className="" value={"Checkbox"}>Checkbox</option>
                <option className="" value={"Radio"}>Radio</option>
                <option className="" value={"Dropdown"}>Dropdown</option>
            </select>
            {currentSelection == "Text" && <TextElementOptions {...{ setElementOptions, elementOptions }}> </TextElementOptions>}
            <Button className="mt-2 hover:scale-100" type="submit">Add Element</Button>
        </form>
    </div>
}


type TextElementOptionsProps = {
    elementOptions: formElOptions
    setElementOptions: set<formElOptions>
}
function TextElementOptions(props: TextElementOptionsProps) {
    const { setElementOptions, elementOptions } = props;
    const changeOptions = (options: { default?: string, name?: string, label?: string, required?: boolean }) => {
        setElementOptions({ ...elementOptions, ...options })
        console.log(elementOptions)
    }
    return <div className="grid grid-flow-row gap-2">
        <label htmlFor="Name">Name:{"(used in the backend not visible to users)"}</label>
        <Input id="Name" type="text" onChange={(e) => {
            // changeOptions({ name: e?.target.value })
            console.log(e.target.value)
            setElementOptions({ ...elementOptions, name: e?.target.value! })
        }} required={true} className="hover:scale-100 focus:scale-100 active:scale-100"></Input>

        <label htmlFor="label">Label:{"(hint shown to users)"}</label>
        <Input id="label" type="text" onChange={(e) => {
            console.log(e.target.value)
            changeOptions({ name: e.target.value })
        }} required={true} className="hover:scale-100 focus:scale-100 active:scale-100"></Input>

        <label htmlFor="defaultValue">Default Value:</label>
        <Input id="defaultValue" type="text" onChange={(e) => {
            changeOptions({ default: e.target.value })
        }} className="hover:scale-100 focus:scale-100 active:scale-100"></Input>

        <div className="grid grid-cols-[1fr_9fr]">
            <input className="hover:scale-110 duration-100" id="inputRequired" type={"checkbox"} name="inputRequired" value="true" onChange={(e) => {
                if (e.target.value == "true") {
                    changeOptions({ required: true })
                }
            }}></input>
            <label htmlFor="inputRequired">Required</label>
        </div>
    </div>
}

type FormDemoProps = {
    formTitle: string,
    formDescription: string,
    formState: formEl[]
}


function FormDemo(props: FormDemoProps) {
    const { formTitle, formDescription, formState } = props
    return <div id="form_demo " className=" text-white">
        <div className="grid grid-flow-row bg-purple-600 m-2 px-2 py-2 text-xl text-white rounded-md">
            <div className="font-bold text-4xl">
                <h1>{formTitle || "Untitled Form"}</h1>
            </div>
            <div>
                <h2>{formDescription || "Undescribed Form"}</h2>
            </div>
        </div>
        <div>
            <form className={`grid grid-flow-row bg-purple-600 m-2 px-2 py-2 text-xl rounded-md ${formState.length == 0 && "hidden"}`}>
                {
                    formState.map(form => {
                        if (form.type == "Text") {
                            return <div className="grid grid-flow-row" key={uuid()}>
                                <label htmlFor={form.options.name}>{form.options.label}</label>
                                <Input id={form.options.name} type="text" defaultValue={form.options.default || ""} required={form.options.required}></Input>
                            </div>
                        }
                    })
                }
            </form>
        </div>
    </div>
}







export const getServerSideProps: GetServerSideProps<any, { username: string }> = async (context) => {
    const token = context.req.cookies.token
    const prisma = new PrismaClient()
    const { username: reqUsername } = context.params!
    if (token) {
        const tokenInfo = await prisma.userToken.findFirst({ where: { value: token } })
        if (tokenInfo) {
            const user = await prisma.user.findFirst({ where: { id: tokenInfo.userId } });
            if (user?.username == reqUsername) {
                return {
                    props: {
                        username: user.username
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
        } else {
            return {
                redirect: {
                    permanent: false,
                    destination: "/"
                }
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