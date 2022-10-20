import { PrismaClient } from "@prisma/client"
import { GetServerSideProps } from "next"
import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
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
        <div className="grid lg:grid-cols-2 sm:grid-cols-2  grid-rows-2">
            <div id="form_designer" className="grid grid-flow-row px-2 py-1 text-lg">
                <Wrapper id="formDescription">
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
                </Wrapper>
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
    const [currentlyEditingElExtraOptions, setCurrentlyEditingElExtraOptions] = useState<string[]>([])

    return <div className="grid">
        <form className="" onSubmit={(e) => {
            e.preventDefault()
            //@ts-ignore
            e.target.reset()
            setFormState([...formState, { type: currentSelection, options: elementOptions }])
            setCurrentlyEditingElExtraOptions([]);
        }}>
            <Wrapper className="text-sm">
                <label htmlFor="elementType">Select Element Type To Add: </label>
                <select id="elementType" className="px-2 py-1 bg-pink-500 text-white rounded-md" onChange={(e) => {
                    setElementOptions({ label: "Add a label", name: "random_name", checkboxoptions: [], default: "", dropdownOptions: [], radioOptions: [], required: false })
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
                {currentSelection == "Checkbox" && <CheckBoxElementOptions {...{ setElementOptions, elementOptions, currentlyEditingElExtraOptions, setCurrentlyEditingElExtraOptions }}></CheckBoxElementOptions>}
                {currentSelection == "Radio" && <RadioElementOptions {...{ setElementOptions, elementOptions, currentlyEditingElExtraOptions, setCurrentlyEditingElExtraOptions }}></RadioElementOptions>}
                {currentSelection == "Dropdown" && <DropDownElementOptions {...{ setElementOptions, elementOptions, currentlyEditingElExtraOptions, setCurrentlyEditingElExtraOptions }}></DropDownElementOptions>}
                <Button className="mt-2 hover:scale-100" type="submit">Add Element</Button>
            </Wrapper>
        </form>
    </div>
}

type TextElementOptionsProps = {
    elementOptions: formElOptions
    setElementOptions: set<formElOptions>
}
function TextElementOptions(props: TextElementOptionsProps) {
    const { setElementOptions, elementOptions } = props;
    return <div className="grid grid-flow-row gap-2">
        <label htmlFor="Name">Name:{"(used in the backend not visible to users)"}</label>
        <Input id="Name" type="text" onChange={(e) => {
            // changeOptions({ name: e?.target.value })
            setElementOptions({ ...elementOptions, name: e?.target.value! })
        }} required={true} className="hover:scale-100 focus:scale-100 active:scale-100"></Input>

        <label htmlFor="label">Label:{"(hint shown to users)"}</label>
        <Input id="label" type="text" onChange={(e) => {
            setElementOptions({ ...elementOptions, label: e?.target.value! })
        }} required={true} className="hover:scale-100 focus:scale-100 active:scale-100"></Input>

        <label htmlFor="defaultValue">Default Value:</label>
        <Input id="defaultValue" type="text" onChange={(e) => {
            setElementOptions({ ...elementOptions, default: e.target.value })
        }} className="hover:scale-100 focus:scale-100 active:scale-100"></Input>

        <div className="grid grid-cols-[1fr_9fr]">
            <input className="hover:scale-110 duration-100" id="inputRequired" type={"checkbox"} name="inputRequired" value="true" onChange={(e) => {
                if (e.target.value == "true") {
                    setElementOptions({ ...elementOptions, required: true })
                }
            }}></input>
            <label htmlFor="inputRequired">Required</label>
        </div>
    </div>
}
type CheckBoxElementOptionsProps = TextElementOptionsProps & {
    currentlyEditingElExtraOptions: string[]
    setCurrentlyEditingElExtraOptions: set<string[]>
}
function CheckBoxElementOptions(props: CheckBoxElementOptionsProps) {
    const { setElementOptions, elementOptions, currentlyEditingElExtraOptions, setCurrentlyEditingElExtraOptions } = props;
    const checkBoxOptionsRef = useRef<HTMLInputElement>(null)
    // const [currentlyEditingElExtraOptions, setCurrentlyEditingElExtraOptions] = [currenlyEditingElExtraOptions, setCurrentlyEditingElExtraOptions];
    return <div className="grid grid-flow-row gap-2">
        <label htmlFor="Name">Name:{"(used in the backend not visible to users)"}</label>
        <Input id="Name" type="text" onChange={(e) => {
            // changeOptions({ name: e?.target.value })
            setElementOptions({ ...elementOptions, name: e?.target.value! })
        }} required={true}></Input>

        <label htmlFor="label">Label:{"(hint shown to users)"}</label>
        <Input id="label" type="text" onChange={(e) => {
            setElementOptions({ ...elementOptions, label: e?.target.value! })
        }} required={true}></Input>

        <label htmlFor="defaultValue">Default Value:</label>
        <Input id="defaultValue" type="text" onChange={(e) => {
            setElementOptions({ ...elementOptions, default: e.target.value })
        }}></Input>

        <label htmlFor="checkBoxOptions">Add Options:</label>
        <div className="grid grid-flow-col gap-2">
            <Input id="checkBoxOptions" type="text" ref={checkBoxOptionsRef}></Input>
            <Button onClick={(e) => {
                if (checkBoxOptionsRef.current && checkBoxOptionsRef.current.value && checkBoxOptionsRef.current.value !== "") {
                    const temp = Object.assign([], currentlyEditingElExtraOptions);
                    temp.push(checkBoxOptionsRef.current.value)
                    setCurrentlyEditingElExtraOptions(temp);
                    console.log(temp)
                    console.log(currentlyEditingElExtraOptions, checkBoxOptionsRef.current.value);
                    setElementOptions({ ...elementOptions, checkboxoptions: temp })
                    checkBoxOptionsRef.current.value = ""
                }
            }} type="button" >Add Option</Button>
        </div>

        <div className="grid grid-cols-[1fr_9fr]">
            <input className="hover:scale-110 duration-100" id="inputRequired" type={"checkbox"} name="inputRequired" value="true" onChange={(e) => {
                if (e.target.value == "true") {
                    setElementOptions({ ...elementOptions, required: true })
                }
            }}></input>
            <label htmlFor="inputRequired">Required</label>
        </div>
    </div>
}
function RadioElementOptions(props: CheckBoxElementOptionsProps) {
    const { setElementOptions, elementOptions, setCurrentlyEditingElExtraOptions, currentlyEditingElExtraOptions } = props;
    const radioOptionsRef = useRef<HTMLInputElement>(null)
    return <div className="grid grid-flow-row gap-2">
        <label htmlFor="Name">Name:{"(used in the backend not visible to users)"}</label>
        <Input id="Name" type="text" onChange={(e) => {
            // changeOptions({ name: e?.target.value })
            setElementOptions({ ...elementOptions, name: e?.target.value! })
        }} required={true}></Input>

        <label htmlFor="label">Label:{"(hint shown to users)"}</label>
        <Input id="label" type="text" onChange={(e) => {
            setElementOptions({ ...elementOptions, label: e?.target.value! })
        }} required={true}></Input>

        <label htmlFor="defaultValue">Default Value:</label>
        <Input id="defaultValue" type="text" onChange={(e) => {
            setElementOptions({ ...elementOptions, default: e.target.value })
        }}></Input>

        <label htmlFor="checkBoxOptions">Add Options:</label>
        <div className="grid grid-flow-col gap-2">
            <Input id="checkBoxOptions" type="text" ref={radioOptionsRef}></Input>
            <Button onClick={() => {
                if (radioOptionsRef.current && radioOptionsRef.current.value && radioOptionsRef.current.value !== "") {
                    const temp = Object.assign([], currentlyEditingElExtraOptions);
                    temp.push(radioOptionsRef.current.value)
                    setCurrentlyEditingElExtraOptions(temp)
                    setElementOptions({ ...elementOptions, radioOptions: temp })
                    radioOptionsRef.current.value = ""
                }
            }} type="button" >Add Option</Button>
        </div>
    </div>
}
function DropDownElementOptions(props: CheckBoxElementOptionsProps) {
    const { setElementOptions, elementOptions, setCurrentlyEditingElExtraOptions, currentlyEditingElExtraOptions } = props;
    const dropDownOptionsRef = useRef<HTMLInputElement>(null)
    return <div className="grid grid-flow-row gap-2">
        <label htmlFor="Name">Name:{"(used in the backend not visible to users)"}</label>
        <Input id="Name" type="text" onChange={(e) => {
            setElementOptions({ ...elementOptions, name: e?.target.value! })
        }} required={true}></Input>

        <label htmlFor="label">Label:{"(hint shown to users)"}</label>
        <Input id="label" type="text" onChange={(e) => {
            setElementOptions({ ...elementOptions, label: e?.target.value! })
        }} required={true}></Input>

        <label htmlFor="defaultValue">Default Value:</label>
        <Input id="defaultValue" type="text" onChange={(e) => {
            setElementOptions({ ...elementOptions, default: e.target.value })
        }}></Input>

        <label htmlFor="checkBoxOptions">Add Options:</label>
        <div className="grid grid-flow-col gap-2">
            <Input id="checkBoxOptions" type="text" ref={dropDownOptionsRef}></Input>
            <Button onClick={() => {
                if (dropDownOptionsRef.current && dropDownOptionsRef.current.value && dropDownOptionsRef.current.value !== "") {
                    const temp = Object.assign([], currentlyEditingElExtraOptions);
                    temp.push(dropDownOptionsRef.current.value)
                    setCurrentlyEditingElExtraOptions(temp)
                    setElementOptions({ ...elementOptions, dropdownOptions: temp })
                    dropDownOptionsRef.current.value = ""
                }
            }} type="button">Add Option</Button>
        </div>
    </div>
}


type WrapperProps = {
    className?: string
    id?: string
}
function Wrapper(props: PropsWithChildren<WrapperProps>) {
    return <div className={`grid grid-flow-row bg-purple-500 my-2 mx-2 rounded-lg text-lg text-white py-2 px-2 ${props.className}`} id={props.id || ""}>
        {props.children}
    </div >
}

type FormDemoProps = {
    formTitle: string,
    formDescription: string,
    formState: formEl[]
}


function FormDemo(props: FormDemoProps) {
    const { formTitle, formDescription, formState } = props
    return <div id="form_demo " className=" text-white">
        <Wrapper key={uuid()}>
            <div className="font-bold text-4xl">
                <h1>{formTitle || "Untitled Form"}</h1>
            </div>
            <div>
                <h2>{formDescription || "Undescribed Form"}</h2>
            </div>
        </Wrapper>
        <div>
            <form className={`${formState.length == 0 && "hidden"}`}>
                <Wrapper key={uuid()}>
                    {

                        formState.map(element => {
                            if (element.type == "Text") {
                                return <div className="grid grid-flow-row gap-2" key={uuid()}>
                                    <label htmlFor={element.options.name} className="sm:text-3xl text-xl font-bold">{element.options.label}</label>
                                    <Input id={element.options.name} type="text" defaultValue={element.options.default || ""} required={element.options.required}></Input>
                                </div>
                            } else if (element.type == "Checkbox") {
                                return <div className="grid grid-flow-row" key={uuid()}>
                                    <p className="sm:text-3xl text-xl font-bold">{element.options.label}</p>
                                    {
                                        element.options.checkboxoptions && element.options.checkboxoptions.map(option => {
                                            return <div key={uuid()} className="grid grid-cols-[1fr_9fr]">
                                                <input id={option} type={"checkbox"} name={element.options.name} value={option}></input>
                                                <label htmlFor={option}>{option}</label>
                                            </div>
                                        })
                                    }
                                </div>
                            } else if (element.type == "Radio") {
                                return <div className="grid grid-flow-row gap-2" key={uuid()}>
                                    <legend className="sm:text-3xl text-xl font-bold">{element.options.label}</legend>
                                    {
                                        element.options.radioOptions && element.options.radioOptions.map((option, index) => {
                                            return <div key={uuid()} className="grid grid-cols-[1fr_9fr]">
                                                <input id={`${option}_${index}`} type="radio" name={element.options.name} required={element.options.required} value={option}></input>
                                                <label htmlFor={`${option}_${index}`}>{option}</label>
                                            </div>
                                        })
                                    }
                                </div>
                            } else if (element.type == "Dropdown") {
                                return <div className="grid grid-flow-row gap-2" key={uuid()}>
                                    <label htmlFor={element.options.name} className="sm:text-3xl text-xl font-bold">{element.options.label}</label>
                                    <select name={element.options.name} id={element.options.name} className="bg-pink-500 rounded-md px-2 py-1">
                                        {element.options.dropdownOptions && element.options.dropdownOptions.map((option, index) => {
                                            return <option key={uuid()} value={option}>
                                                {option}
                                            </option>
                                        })}
                                    </select>
                                </div>
                            }

                        })
                    }
                </Wrapper>
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