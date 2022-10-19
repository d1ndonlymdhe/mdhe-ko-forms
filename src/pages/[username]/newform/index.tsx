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
        <div className="grid grid-cols-2">
            <div id="form_designer" className="grid grid-flow-row max-w-[50vw] px-2 py-1">
                <div id="formDescription" className="grid grid-flow-row">
                    <label htmlFor="formTitle">Title:</label>
                    <Input id="formTitle" type="text" onChange={(e) => {
                        setFormTitle(FormTitleRef.current?.value!)
                    }
                    } ref={FormTitleRef}></Input>
                    <label htmlFor="formDescription">Description:</label>
                    <Input id="formDescription" type="text" onChange={(e) => {
                        setFormDescription(FormDescriptionRef.current?.value!)
                    }
                    } ref={FormDescriptionRef}></Input>
                </div>
                <div id="formElements">

                </div>
                <div>
                    <AddFromElement {...{ setFormState, formState }}></AddFromElement>
                </div>
            </div>
            <div id="form_demo grid grid-flow-row">
                <div>
                    <h1>{formTitle || "Untitled Form"}</h1>
                </div>
                <div>
                    <h2>{formDescription || "Undescribed Form"}</h2>
                </div>
                <div>
                    <form className="grid grid-flow-row">
                        {
                            formState.map(form => {
                                if (form.type == "Text") {
                                    return <div className="grid grid-flow-row">
                                        <label htmlFor={form.options.name}>{form.options.label}</label>
                                        <Input id={form.options.name} type="text" value={form.options.default || ""} required={form.options.required}></Input>
                                    </div>
                                }
                            })
                        }
                    </form>
                </div>
            </div>
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
        <form className="grid grid-flow-col" onSubmit={(e) => { e.preventDefault() }}>
            <select onChange={(e) => {
                //@ts-ignore
                setCurrentSelection(e.target.value!)
            }} defaultValue="Text">
                <option value={"Text"}>Text</option>
                <option value={"Checkbox"}>Checkbox</option>
                <option value={"Radio"}>Radio</option>
                <option value={"Dropdown"}>Dropdown</option>
            </select>
            {currentSelection == "Text" && <TextElementOptions {...{ setElementOptions, elementOptions }}> </TextElementOptions>}
            <Button onClick={() => {
                setFormState([...formState, { type: currentSelection, options: elementOptions }])

            }}>Add Element</Button>
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
    return <div>

        <label htmlFor="Name">Name:{"(used in the backend not visible to users)"}</label>
        <Input id="Name" type="text" onChange={(e) => {
            changeOptions({ name: e?.target.value })
        }} required={true}></Input>

        <label htmlFor="label">Label:{"(hint shown to users)"}</label>
        <Input id="label" type="text" onChange={(e) => {
            changeOptions({ name: e?.target.value })
        }} required={true}></Input>

        <label htmlFor="defaultValue">Default Value:</label>
        <Input id="defaultValue" type="text" onChange={(e) => {
            changeOptions({ default: e?.target.value })
        }}></Input>

        <input id="inputRequired" type={"checkbox"} name="inputRequired" value="true" onChange={(e) => {
            if (e.target.value == "true") {
                changeOptions({ required: true })
            }
        }}></input>
        <label htmlFor="inputRequired">Required</label>
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