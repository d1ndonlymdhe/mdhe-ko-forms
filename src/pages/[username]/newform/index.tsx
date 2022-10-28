import { PrismaClient } from "@prisma/client"
import { GetServerSideProps } from "next"
import React, { useRef, useState } from "react";
import Button from "../../../components/Button";
import TopBar from "../../../components/Topbar";
import uuid from "react-uuid"
import Input from "../../../components/Input";
import { ArrowDownIcon, ArrowUpIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { trpc } from "../../../utils/trpc";
import ModalWithBackdrop from "../../../components/ModelWithBackdrop";
import Head from "next/head";
import Link from "next/link";
import Wrapper from "../../../components/Wrapper"
type set<T> = React.Dispatch<React.SetStateAction<T>>

type pageProps = {
    username: string
}
export type formEl = {
    type: "Text" | "Radio" | "Checkbox" | "Dropdown",
    options: formElOptions
}
type formElOptions = {
    name: string,
    label: string,
    elOptions?: string[]
    defaultValue?: string
    required?: boolean
    key: string;
}

export default function FormMaker(props: pageProps) {
    const { username } = props;
    const [formState, setFormState] = useState<formEl[]>([])
    const [formTitle, setFormTitle] = useState("Untitled Form")
    const [formDescription, setFormDescription] = useState("Undescribed Form")
    const [showModal, setShowModal] = useState(false);
    const FormTitleRef = useRef<HTMLInputElement>(null)
    const FormDescriptionRef = useRef<HTMLInputElement>(null)
    const [formStatus, setFormStatus] = useState("Loading")
    const createFormMutation = trpc.form.createForm.useMutation({
        onSuccess: (data) => {
            setFormStatus(data?.status == "success" ? "Success" : "Error")
        },
        onError: () => {
            setFormStatus("Error")
        }
    });
    return <>
        <Head>
            <title>
                {"Create New Form"}
            </title>
        </Head>
        {
            showModal && <ModalWithBackdrop title={`Form Creation Status: ${formStatus}`} onClick={() => {
                if (!createFormMutation.isLoading) {
                    setShowModal(false)
                }
            }}>
                <div className="grid grid-flow-row gap-y-2 justify-center">
                    {
                        formStatus == "Success" &&
                        <Link href={`/${username}/${createFormMutation.data?.data.formId}`}><a target={"_blank"}><Button expand={true}>Go To Form</Button></a></Link>
                    }
                    <Button expand={true} className={`bg-red-400 ${formStatus == "loading" && "bg-orange-400"}`} onClick={() => {
                        if (!createFormMutation.isLoading) {
                            setShowModal(false)
                        }
                    }}>{formStatus == "loading" ? "Loading" : "Exit"}</Button>
                </div>
            </ModalWithBackdrop>
        }
        <TopBar></TopBar>
        <div className="grid lg:grid-cols-2 sm:grid-cols-2 grid-rows-2 gap-x-4 gap-y-2 mt-4 mx-2">
            <div id="form_designer" className="grid grid-flow-row px-2 py-1 text-lg h-[95%] gap-y-2">
                <Wrapper id="formDescription">
                    <label htmlFor="formTitle">Title:</label>
                    <Input id="formTitle" type="text" onChange={() => {
                        if (FormTitleRef.current) {
                            setFormTitle(FormTitleRef.current.value)
                        }
                    }
                    } ref={FormTitleRef} className="hover:scale-100 focus:scale-100 active:scale-100"></Input>
                    <label htmlFor="formDescription">Description:</label>
                    <Input id="formDescription" type="text" onChange={() => {
                        if (FormDescriptionRef.current) {
                            setFormDescription(FormDescriptionRef.current.value)
                        }
                    }
                    } ref={FormDescriptionRef} className="hover:scale-100 focus:scale-100 active:scale-100"></Input>
                </Wrapper>
                <div className="">
                    <AddFromElement {...{ setFormState, formState }}></AddFromElement>
                </div>
                <div>
                    <Button onClick={() => {
                        createFormMutation.mutate({ elements: formState, title: formTitle, description: formDescription })
                        setShowModal(true)
                    }} className="mx-2" >Complete</Button>
                </div>
            </div>
            <FormDemo {...{ formState, formTitle, formDescription, setFormState }}></FormDemo>
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
    const [elementOptions, setElementOptions] = useState<formElOptions>({ label: "Add a label", name: "random_name", elOptions: [], defaultValue: "", required: false, key: (new Date().getTime().toString()) })
    const [currentlyEditingElExtraOptions, setCurrentlyEditingElExtraOptions] = useState<string[]>([])
    const formRef = useRef<HTMLFormElement>(null)
    return <div className="grid">
        <form className="" ref={formRef} onSubmit={(e) => {
            e.preventDefault()
            formRef.current && formRef.current.reset()
            setFormState([...formState, { type: currentSelection, options: elementOptions }])
            setCurrentSelection("Text")
            setCurrentlyEditingElExtraOptions([]);
        }}>
            <Wrapper className="text-sm">
                <label htmlFor="elementType">Select Element Type To Add: </label>
                <select id="elementType" className="px-2 py-1 bg-pink-500 text-white rounded-md" onChange={(e) => {
                    setElementOptions({ label: "Add a label", name: "random_name", elOptions: [], defaultValue: "", required: false, key: (new Date().getTime().toString()) })
                    if (e.target) {
                        const value = e.target.value;
                        if (value == "Text" || value == "Checkbox" || value == "Radio" || value == "Dropdown") {
                            setCurrentSelection(value)
                        }
                    }
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
            setElementOptions({ ...elementOptions, name: e.target.value })
        }} required={true} className="hover:scale-100 focus:scale-100 active:scale-100"></Input>

        <label htmlFor="label">Label:{"(hint shown to users)"}</label>
        <Input id="label" type="text" onChange={(e) => {
            setElementOptions({ ...elementOptions, label: e.target.value })
        }} required={true} className="hover:scale-100 focus:scale-100 active:scale-100"></Input>

        <label htmlFor="defaultValue">Default Value:</label>
        <Input id="defaultValue" type="text" onChange={(e) => {
            setElementOptions({ ...elementOptions, defaultValue: e.target.value })
        }} className="hover:scale-100 focus:scale-100 active:scale-100"></Input>

        <div className="grid grid-cols-[1fr_9fr]">
            <input className="hover:scale-110 duration-100" id="inputRequired" type={"checkbox"} name="inputRequired" value="true" onChange={() => {
                setElementOptions({ ...elementOptions, required: true })
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
    return <div className="grid grid-flow-row gap-2">
        <label htmlFor="Name">Name:{"(used in the backend not visible to users)"}</label>
        <Input id="Name" type="text" onChange={(e) => {
            setElementOptions({ ...elementOptions, name: e.target.value })
        }} required={true}></Input>

        <label htmlFor="label">Label:{"(hint shown to users)"}</label>
        <Input id="label" type="text" onChange={(e) => {
            setElementOptions({ ...elementOptions, label: e.target.value })
        }} required={true}></Input>

        <label htmlFor="defaultValue">Default Value:</label>
        <Input id="defaultValue" type="text" onChange={(e) => {
            setElementOptions({ ...elementOptions, defaultValue: e.target.value })
        }}></Input>

        <label htmlFor="checkBoxOptions">Add Options:</label>
        <div className="grid grid-flow-col gap-2">
            <Input id="checkBoxOptions" type="text" ref={checkBoxOptionsRef}></Input>
            <Button onClick={() => {
                if (checkBoxOptionsRef.current && checkBoxOptionsRef.current.value && checkBoxOptionsRef.current.value !== "") {
                    const temp = Object.assign([], currentlyEditingElExtraOptions);
                    temp.push(checkBoxOptionsRef.current.value)
                    setCurrentlyEditingElExtraOptions(temp);
                    console.log(temp)
                    console.log(currentlyEditingElExtraOptions, checkBoxOptionsRef.current.value);
                    setElementOptions({ ...elementOptions, elOptions: temp })
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
            setElementOptions({ ...elementOptions, name: e.target.value })
        }} required={true}></Input>

        <label htmlFor="label">Label:{"(hint shown to users)"}</label>
        <Input id="label" type="text" onChange={(e) => {
            setElementOptions({ ...elementOptions, label: e.target.value })
        }} required={true}></Input>

        <label htmlFor="defaultValue">Default Value:</label>
        <Input id="defaultValue" type="text" onChange={(e) => {
            setElementOptions({ ...elementOptions, defaultValue: e.target.value })
        }}></Input>

        <label htmlFor="checkBoxOptions">Add Options:</label>
        <div className="grid grid-flow-col gap-2">
            <Input id="checkBoxOptions" type="text" ref={radioOptionsRef}></Input>
            <Button onClick={() => {
                if (radioOptionsRef.current && radioOptionsRef.current.value && radioOptionsRef.current.value !== "") {
                    const temp = Object.assign([], currentlyEditingElExtraOptions);
                    temp.push(radioOptionsRef.current.value)
                    setCurrentlyEditingElExtraOptions(temp)
                    setElementOptions({ ...elementOptions, elOptions: temp })
                    radioOptionsRef.current.value = ""
                }
            }} type="button" >Add Option</Button>
        </div>
    </div>
}
function DropDownElementOptions(props: CheckBoxElementOptionsProps) {
    const { setElementOptions, elementOptions, setCurrentlyEditingElExtraOptions, currentlyEditingElExtraOptions } = props;
    const [editBox, setEditBox] = useState(false)
    const dropDownOptionsRef = useRef<HTMLInputElement>(null)
    return <div className="grid grid-flow-row gap-2">

        <label htmlFor="Name">Name:{"(used in the backend not visible to users)"}</label>
        <Input id="Name" type="text" onChange={(e) => {
            setElementOptions({ ...elementOptions, name: e.target.value })
        }} required={true}></Input>

        <label htmlFor="label">Label:{"(hint shown to users)"}</label>
        <Input id="label" type="text" onChange={(e) => {
            setElementOptions({ ...elementOptions, label: e.target.value })
        }} required={true}></Input>
        <label htmlFor="defaultValue">Default Value:</label>
        <Input id="defaultValue" type="text" onChange={(e) => {
            setElementOptions({ ...elementOptions, defaultValue: e.target.value })
        }}></Input>
        <label htmlFor="checkBoxOptions">Add Options:</label>
        <div className="grid grid-flow-col gap-2">
            <Input id="checkBoxOptions" type="text" ref={dropDownOptionsRef}></Input>
            <Button onClick={() => {
                if (dropDownOptionsRef.current && dropDownOptionsRef.current.value && dropDownOptionsRef.current.value !== "") {
                    const temp = Object.assign([], currentlyEditingElExtraOptions);
                    temp.push(dropDownOptionsRef.current.value)
                    setCurrentlyEditingElExtraOptions(temp)
                    setElementOptions({ ...elementOptions, elOptions: temp })
                    dropDownOptionsRef.current.value = ""
                }
            }} type="button">Add Option</Button>
        </div>
    </div>
}




type FormDemoProps = {
    formTitle: string,
    formDescription: string,
    formState: formEl[]
    setFormState: set<formEl[]>
}


function FormDemo(props: FormDemoProps) {
    const { formTitle, formDescription, formState, setFormState } = props
    type formElControlsProps = {
        formState: formEl[]
        element: formEl,
        setElement: set<formEl>
        setFormState: set<formEl[]>
    }
    const FormElControls = (props: formElControlsProps) => {
        const { element, setElement, formState, setFormState } = props
        const [editBox, setEditBox] = useState(false)
        const [defaultValue, setDefaultValue] = useState(element.options.defaultValue)
        const [name, setName] = useState(element.options.name)
        const [label, setLabel] = useState(element.options.label)
        const [required, setRequired] = useState(element.options.required)
        return <div className="grid grid-flow-col w-fit gap-2 bg-cyan-500 py-1 px-2 rounded-md">
            {
                editBox && <ModalWithBackdrop title="Edit Element" onClick={() => {
                    setEditBox(false)
                }}>
                    <div className="grid grid-flow-row gap-y-2 justify-center">
                        <div>
                            <div>
                                <label htmlFor="nameEditor">Name:</label>
                                <Input id="nameEditor" type={"text"} defaultValue={name} onChange={(e) => {
                                    setName(e.target.value)
                                }} required></Input>
                            </div>
                            <div>
                                <label htmlFor="Label">Label</label>
                                <Input id="Label" type="text" defaultValue={label} onChange={(e) => {
                                    setLabel(e.target.value)
                                }}></Input>
                            </div>
                            <div>
                                <label htmlFor="defaultValue">Deafult</label>
                                <Input id="defaultValue" type="text" defaultValue={defaultValue} onChange={(e) => {
                                    setDefaultValue(e.target.value)
                                }}></Input>
                            </div>
                            {element.type !== "Checkbox" &&
                                <div>
                                    <input id="required" type={"checkbox"} value="required" checked={required} onChange={() => {
                                        setRequired(!required)
                                    }}></input>
                                    <label htmlFor="required">Required</label>
                                </div>}
                            <Button type="button" onClick={(e) => {
                                console.log("preventing default")
                                e.preventDefault();
                                setElement({ ...element, options: { ...element.options, defaultValue, name, label, required } })
                                const tempFormState = formState;
                                for (let i = 0; i < tempFormState.length; i++) {
                                    const tempElement = tempFormState[i];
                                    if (JSON.stringify(element) == JSON.stringify(tempElement || {}) && tempElement) {
                                        tempElement.options = element.options;
                                        console.log(defaultValue, name)
                                        tempElement.options.defaultValue = defaultValue
                                        tempElement.options.name = name
                                        tempElement.options.label = label
                                        tempElement.options.required = required
                                        break;
                                    }
                                }
                                setFormState(tempFormState);
                                setEditBox(false)
                            }}>Set Values</Button>
                        </div>
                    </div>
                </ModalWithBackdrop>
            }
            <ArrowUpIcon className="w-6 h-6 hover:cursor-pointer" onClick={() => {
                let temp = [...formState]
                temp = moveElUpInArr(element, formState)
                setFormState(temp)
            }}></ArrowUpIcon>
            <ArrowDownIcon className="w-6 h-6 hover:cursor-pointer" onClick={() => {
                let temp = [...formState]
                temp = moveElDownInArr(element, formState)
                setFormState(temp)
            }}></ArrowDownIcon>
            <PencilIcon className="w-6 h-6 hover:cursor-pointer" onClick={() => {
                setEditBox(true)
            }}>
            </PencilIcon>
            <TrashIcon className="w-6 h-6 hover:cursor-pointer" onClick={() => {
                let temp = [...formState]
                temp = removeFromArr(element, formState)
                setFormState(temp)
            }}></TrashIcon>
        </div>
    }

    type CustomElementProps = { element: formEl, formState: formEl[], setFormState: set<formEl[]> }
    const CustomInputFormElement = (props: CustomElementProps) => {
        const { element: propElement, formState, setFormState } = props;
        const [element, setElement] = useState(propElement);
        console.log(element)
        return <>
            <div className="grid grid-flow-col gap-2 items-center justify-start">

                <label htmlFor={element.options.name} className="sm:text-3xl text-xl font-bold w-fit">{element.options.label}</label>
                <FormElControls {...{ formState, element, setFormState, setElement }}></FormElControls>
            </div>
            <Input id={element.options.name} type="text" defaultValue={element.options.defaultValue || ""} required={element.options.required} key={uuid()}></Input>

        </>
    }
    const CustomCheckBoxFormElement = (props: CustomElementProps) => {
        const { element: propElement, formState, setFormState } = props;
        const [element, setElement] = useState(propElement);
        const newOptionRef = useRef<HTMLInputElement>(null)
        return <>
            <div className="grid grid-flow-col gap-2 items-center justify-start">
                <p className="sm:text-3xl text-xl font-bold">{element.options.label}</p>
                <FormElControls {...{ formState, element, setFormState, setElement }}></FormElControls>
            </div>
            <div className="grid grid-flow-row gap-2">
                {
                    element.options.elOptions && element.options.elOptions.map(option => {
                        return <CustomFormCheckBox {...{ option, element, formState, setFormState }} key={uuid()}></CustomFormCheckBox>
                    })
                }
            </div>
            <div className="mt-2 grid grid-flow-row gap-2">
                <Input type="text" ref={newOptionRef}></Input>

                <Button onClick={() => {
                    if (newOptionRef) {
                        if (newOptionRef.current) {
                            if (newOptionRef.current.value && newOptionRef.current.value !== "") {
                                const tempElement = Object.assign({}, element)
                                if (tempElement.options.elOptions) {
                                    tempElement.options.elOptions.push(newOptionRef.current.value);
                                    setElement(tempElement);
                                    newOptionRef.current.value = ""
                                }
                            }
                        }
                    }
                }} type="button">Add Option</Button>
            </div>
        </>
    }
    const CustomRadioFormElement = (props: CustomElementProps) => {
        const { element: propElement, formState, setFormState } = props;
        const [element, setElement] = useState(propElement);
        const newOptionRef = useRef<HTMLInputElement>(null)

        return <>
            <div className="grid grid-flow-col gap-2 items-center justify-start">
                <legend className="sm:text-3xl text-xl font-bold">{element.options.label}</legend>
                <FormElControls {...{ formState, element, setFormState, setElement }} ></FormElControls>
            </div>
            <div className="grid grid-flow-row gap-2">

                {
                    element.options.elOptions && element.options.elOptions.map((option, index) => {
                        return <CustomFormRadio {...{ element, option, index, formState, setFormState }} key={uuid()}></CustomFormRadio>
                    })
                }
                <div className="mt-2 grid grid-flow-row gap-2">
                    <Input type="text" ref={newOptionRef}></Input>

                    <Button onClick={() => {
                        if (newOptionRef) {
                            if (newOptionRef.current) {
                                if (newOptionRef.current.value && newOptionRef.current.value !== "") {
                                    const tempElement = Object.assign({}, element)
                                    if (tempElement.options.elOptions) {
                                        tempElement.options.elOptions.push(newOptionRef.current.value);
                                        setElement(tempElement);
                                        newOptionRef.current.value = ""
                                    }
                                }
                            }
                        }
                    }} type="button">Add Option</Button>
                </div>
            </div>
        </>
    }
    const CustomDropdownFormElement = (props: CustomElementProps) => {
        const { element: propElement, formState, setFormState } = props;
        const [element, setElement] = useState(propElement);
        const newOptionRef = useRef<HTMLInputElement>(null)

        return <>
            <div className="grid grid-flow-row gap-2">
                <div className="grid grid-flow-col gap-2 items-center justify-start">
                    <label htmlFor={element.options.name} className="sm:text-3xl text-xl font-bold">{element.options.label}</label>
                    <FormElControls {...{ formState, element, setFormState, setElement }} ></FormElControls>
                </div>
                <CustomFormDropdown {...{ element, formState, setFormState }}></CustomFormDropdown>
            </div>
            <div className="grid grid-flow-row gap-2 bg-green-500 rounded-md px-2 py-1 mt-2">
                <p className="text-sm">Edit dropdown options (not visible to userse)</p>
                <div className="grid grid-flow-row gap-2 px-2 py-1">
                    {element.options.elOptions && element.options.elOptions.map((option) => {
                        return (
                            <div className="grid grid-flow-col gap-2 items-center justify-start" key={uuid()}>
                                <p>{option}</p>
                                <FormElOptionsControl {...{ element, formState, option, setFormState }}></FormElOptionsControl>
                            </div>
                        )
                    })}
                </div>
                <div className="mt-2 grid grid-flow-row gap-2">
                    <Input type="text" ref={newOptionRef}></Input>

                    <Button onClick={() => {
                        if (newOptionRef) {
                            if (newOptionRef.current) {
                                if (newOptionRef.current.value && newOptionRef.current.value !== "") {
                                    const tempElement = Object.assign({}, element)
                                    if (tempElement.options.elOptions) {
                                        tempElement.options.elOptions.push(newOptionRef.current.value);
                                        setElement(tempElement);
                                        newOptionRef.current.value = ""
                                    }
                                }
                            }
                        }
                    }} type="button">Add Option</Button>
                </div>
            </div>

        </>
    }

    return <div id="form_demo " className=" text-white flex flex-col gap-y-2 h-[95%] mt-1">
        <Wrapper key={uuid()}>
            <div className="font-bold text-4xl h-fit">
                <h1>{formTitle || "Untitled Form"}</h1>
            </div>
            <div className="h-fit">
                <h2>{formDescription || "Undescribed Form"}</h2>
            </div>
        </Wrapper>
        <div>
            <form className={`${formState.length == 0 && "hidden"}`}>
                <Wrapper key={uuid()} className="gap-4">
                    {
                        formState.map(element => {
                            if (element.type == "Text") {
                                return <div className="grid grid-flow-row gap-2" key={uuid()}>
                                    <CustomInputFormElement {...{ element, formState, setFormState }}></CustomInputFormElement>
                                </div>
                            } else if (element.type == "Checkbox") {
                                return <div className="grid grid-flow-row gap-2" key={uuid()}>
                                    <CustomCheckBoxFormElement {...{ element, formState, setFormState }}></CustomCheckBoxFormElement>
                                </div>
                            } else if (element.type == "Radio") {
                                return <div className="grid grid-flow-row gap-2" key={uuid()}>
                                    <CustomRadioFormElement {...{ element, formState, setFormState }}></CustomRadioFormElement>
                                </div>
                            } else if (element.type == "Dropdown") {
                                return <div className="grid grid-flow-col gap-2" key={uuid()}>
                                    <CustomDropdownFormElement {...{ element, formState, setFormState }}></CustomDropdownFormElement>
                                </div>
                            }
                        })
                    }
                </Wrapper>
            </form>
        </div>
    </div>
}

type CustomFormCheckBoxProps = {
    element: formEl,
    option: string,
    index?: number,
    formState: formEl[],
    setFormState: set<formEl[]>
}

type formElOptionsControlsProps = {
    formState: formEl[]
    element: formEl
    setFormState: set<formEl[]>,
    option: string
}
function FormElOptionsControl(props: formElOptionsControlsProps) {
    const { element, formState, setFormState, option } = props;
    return <div className="grid grid-flow-col w-fit gap-2 bg-green-500 py-1 px-2 rounded-md">
        <ArrowUpIcon className="w-6 h-6 hover:cursor-pointer" onClick={() => {
            const temp = [...formState]
            let tempOptions: string[] = []
            if (element.options.elOptions) {
                tempOptions = [...element.options.elOptions]
            }
            tempOptions = moveElUpInArr(option, tempOptions)
            for (let i = 0; i < temp.length; i++) {
                if (JSON.stringify(temp[i]) == JSON.stringify(element)) {
                    const t = temp[i]
                    if (t) {
                        t.options.elOptions = tempOptions;
                    }
                }
            }
            setFormState(temp)
        }}></ArrowUpIcon>
        <ArrowDownIcon className="w-6 h-6 hover:cursor-pointer" onClick={() => {
            const temp = [...formState]
            let tempOptions: string[] = []
            if (element.options.elOptions) {
                tempOptions = [...element.options.elOptions]
            }
            tempOptions = moveElDownInArr(option, tempOptions)
            for (let i = 0; i < temp.length; i++) {
                if (JSON.stringify(temp[i]) == JSON.stringify(element)) {
                    const t = temp[i]
                    if (t) {
                        t.options.elOptions = tempOptions;
                    }
                }
            }
            setFormState(temp)
        }}></ArrowDownIcon>
        <TrashIcon className="w-6 h-6 hover:cursor-pointer" onClick={() => {
            let temp = [...formState]
            let tempOptions: string[] = []
            if (element.options.elOptions) {
                tempOptions = [...element.options.elOptions]
            }
            tempOptions = removeFromArr(option, tempOptions)
            for (let i = 0; i < temp.length; i++) {
                if (JSON.stringify(temp[i]) == JSON.stringify(element)) {
                    const t = temp[i]
                    if (t) {
                        t.options.elOptions = tempOptions;
                    }
                }
            }
            if (tempOptions.length == 0) {
                temp = removeFromArr(element, temp);
            }
            setFormState(temp)
        }}></TrashIcon>
    </div>
}

function CustomFormCheckBox(props: CustomFormCheckBoxProps) {
    //TODO need to add feature for adding multiple default values
    const { element, option, formState, setFormState, index } = props
    const [checked, setChecked] = useState(element.options.defaultValue == option)
    return <div key={uuid()} className="grid grid-cols-[1fr_8fr_1fr] gap-2">
        <input id={`${option}_${index}`} type={"checkbox"} name={element.options.name} value={option} checked={checked} onChange={() => {
            setChecked(!checked)
        }}></input>
        <div className="grid grid-flow-col gap-2 items-center justify-start">
            <label htmlFor={`${option}_${index}`}>{option}</label>
            <FormElOptionsControl {...{ element, formState, option, setFormState }} ></FormElOptionsControl>
        </div>
    </div>
}
function CustomFormRadio(props: CustomFormCheckBoxProps) {
    const { element, option, index, formState, setFormState } = props;
    const [checked, setChecked] = useState(element.options.defaultValue == option)
    return <div key={uuid()} className="grid grid-cols-[1fr_9fr] gap-2">
        <input id={`${option}_${index}`} type="radio" name={element.options.name} checked={checked} required={element.options.required} value={option} onChange={() => {
            setChecked(!checked)
        }}></input>
        <div className="grid grid-flow-col gap-2 items-center justify-start">
            <label htmlFor={`${option}_${index}`}>{option}</label>
            <FormElOptionsControl {...{ element, formState, option, setFormState }} ></FormElOptionsControl>
        </div>

    </div>
}
type CustomFormDropdownProps = {
    element: formEl,
    formState: formEl[],
    setFormState: set<formEl[]>
}
function CustomFormDropdown(props: CustomFormDropdownProps) {
    const { element } = props;
    return <select name={element.options.name} id={element.options.name} className="bg-pink-500 rounded-md px-2 py-1" defaultValue={element.options.defaultValue || ""}>
        {element.options.elOptions && element.options.elOptions.map((option) => {
            return (
                <option key={uuid()} value={option}>
                    <p>{option}</p>
                </option>
            )
        })}
    </select>
}

export const getServerSideProps: GetServerSideProps<any, { username: string }> = async (context) => {
    const token = context.req.cookies.token
    const prisma = new PrismaClient()
    if (context.params) {
        const { username: reqUsername } = context.params
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
    return {
        redirect: {
            permanent: false,
            destination: "/"
        }
    }
}


function moveElUpInArr<T>(el: T, arr: T[]) {
    const retArr: T[] = []
    let indexOfEl = -1
    for (let i = 0; i < arr.length; i++) {
        if (JSON.stringify(el) === JSON.stringify(arr[i])) {
            indexOfEl = i;
            break;
        }
    }
    if (indexOfEl !== -1 && indexOfEl !== 0) {
        for (let i = 0; i < arr.length; i++) {
            if (i == indexOfEl - 1) {
                retArr.push(el)
            } else if (i == indexOfEl) {
                const a = arr[i - 1]
                if (a) {
                    retArr.push(a)
                }
            }
            else {
                const a = arr[i]
                if (a) {
                    retArr.push(a)
                }
            }
        }
        return retArr;
    }
    return arr;
}
function moveElDownInArr<T>(el: T, arr: T[]) {
    const retArr: T[] = []
    let indexOfEl = -1;
    for (let i = 0; i < arr.length; i++) {
        if (JSON.stringify(el) === JSON.stringify(arr[i])) {
            indexOfEl = i;
            break;
        }
    }
    if (indexOfEl !== -1 && indexOfEl !== arr.length - 1) {
        for (let i = arr.length - 1; i >= 0; i--) {
            if (i == indexOfEl + 1) {
                retArr[i] = el;
            } else if (i == indexOfEl) {
                const a = arr[i + 1]
                if (a) {
                    retArr[i] = a;
                }
            } else {
                const a = arr[i]
                if (a) {
                    retArr[i] = a;
                }
            }
        }
        return retArr
    }
    return arr
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
