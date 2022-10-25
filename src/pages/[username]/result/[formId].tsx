import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import { PrismaClient } from "@prisma/client";
import { GetServerSideProps } from "next";
import { useState } from "react";
import uuid from "react-uuid";
import { form, formEl } from "..";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import TopBar from "../../../components/Topbar";
import Wrapper from "../../../components/Wrapper";
import userFromToken from "../../../utils/userFromToken";
type PageProps = {
    formData?: form,
    error?: string,
}

// export default function FormResults(props: PageProps) {
//     const { formData, error } = props;
//     if (error) {
//         if (error == "NO_AUTH") {
//             return <div>You are not authorized to view this content</div>
//         } else {
//             return <div>An error occured</div>
//         }
//     }
//     if (formData) {
//         return <div className="mx-2 grid grid-rows-[1fr_9fr]">
//             <TopBar></TopBar>

//         </div>
//     }
// }



//expand here
export default function FormResults(props: PageProps) {
    console.log(props)
    const { formData: form, error } = props
    const [formIndex, setFormIndex] = useState(0);
    console.log(form)
    if (!form) {
        return <div className="grid grid-rows-[1fr_9fr]">
            <TopBar></TopBar>
            <div className="w-screen h-full grid justify-center items-center">
                <span className="text-9xl text-gray-600 font-bold">
                    An Error Occured
                </span>
            </div>
        </div>
    }
    if (form.entries == 0) {
        return <div>
            No Entries
        </div>
    }
    return <div className="grid grid-rows-[1fr_auto_auto] gap-2 bg-slate-500">
        <TopBar></TopBar>
        <div className="grid justify-center mx-2 mb-2 gap-y-2">
            <Wrapper className="grid grid-flow-col justify-center gap-x-2">
                <Button onClick={(e) => {
                    if (formIndex > 0) {
                        setFormIndex(formIndex - 1)
                    }
                }}><ArrowLeftIcon className="w-6 h-6"></ArrowLeftIcon></Button>
                <div>{formIndex + 1} Of {form.entries}</div>
                <Button onClick={(e) => {
                    if (formIndex + 1 !== form.entries) {
                        setFormIndex(formIndex + 1)
                    }
                }}><ArrowRightIcon className="w-6 h-6"></ArrowRightIcon></Button>
            </Wrapper>
            <div className="grid grid-flow-row gap-y-2">
                <Wrapper className="">
                    <div className="font-bold text-4xl h-fit">
                        <h1>{form.title}</h1>
                    </div>
                    <div className="h-fit">
                        <h2>{form.description}</h2>
                    </div>
                </Wrapper>
                <form className="grid grid-flow-row gap-y-2 sm:w-[60vw]" onSubmit={(e) => {
                    e.preventDefault()
                }}>
                    <Wrapper className="gap-y-4">
                        {
                            form.elements.map(element => {
                                if (element.type == "Text") {
                                    return <div className="grid grid-flow-row gap-2" key={uuid()}>
                                        <label htmlFor={element.name} className="sm:text-3xl text-xl font-bold">{element.label}</label>
                                        <Input id={element.name} readonly={true} type="text" defaultValue={JSON.parse(element.values[formIndex]?.value || "") || ""} required={element.required} name={element.name}></Input>
                                    </div>
                                } else if (element.type == "Checkbox") {
                                    return <div className="grid grid-flow-row" key={uuid()}>
                                        <p className="sm:text-3xl text-xl font-bold">{element.label}</p>
                                        <div className="grid grid-flow-row gap-2">
                                            {
                                                element.elOptions && element.elOptions.map((option, index) => {
                                                    return <CustomFormCheckBox {...{ element, option: option.option, index, formIndex }} key={uuid()}></CustomFormCheckBox>
                                                })
                                            }
                                        </div>
                                    </div>
                                } else if (element.type == "Radio") {
                                    return <div className="grid grid-flow-row" key={uuid()}>
                                        <legend className="sm:text-3xl text-xl font-bold">{element.label}</legend>
                                        <div className="grid grid-flow-row gap-2">
                                            {
                                                element.elOptions && element.elOptions.map((option, index) => {
                                                    return <CustomFormRadio {...{ element, option: option.option, index, formIndex }} key={uuid()}></CustomFormRadio>
                                                })
                                            }
                                        </div>
                                    </div>
                                } else if (element.type == "Dropdown") {
                                    return <div className="grid grid-flow-col gap-2" key={uuid()}>
                                        <div className="grid grid-flow-row gap-2">
                                            <label htmlFor={element.name} className="sm:text-3xl text-xl font-bold">{element.label}</label>
                                            <select name={element.name} id={element.name} disabled={true} className="bg-pink-500 rounded-md px-2 py-1" defaultValue={element.values[formIndex]?.value || ""}>
                                                {
                                                    element.elOptions && element.elOptions.map((option) => {
                                                        return <option key={uuid()} value={option.option}>{option.option}</option>
                                                    })
                                                }
                                            </select>
                                        </div>
                                    </div>
                                }
                            })
                        }
                    </Wrapper>
                </form>
            </div>
        </div>
    </div>
}


type CustomFormCheckBoxProps = {
    element: formEl,
    option: string,
    index: number,
    formIndex: number,
}
function CustomFormCheckBox(props: CustomFormCheckBoxProps) {
    const { element, option, index, formIndex } = props
    let values: string[] = []
    if (element.values[formIndex]?.value) {
        const v = element.values[formIndex]
        if (v) {
            values = JSON.parse(v.value)
        }
    }
    const [checked, setChecked] = useState(values.includes(option))
    return <div key={uuid()} className="grid grid-cols-[1fr_9fr] gap-2">
        <input id={`${option}_${index}`} type="checkbox" name={element.name} readOnly={true} value={option} checked={checked}></input>
        <label htmlFor={`${option}_${index}`}>{option}</label>
    </div>
}
function CustomFormRadio(props: CustomFormCheckBoxProps) {
    const { element, option, index, formIndex } = props
    let values: string[] = []
    if (element.values[formIndex]?.value) {
        const v = element.values[formIndex]
        if (v) {
            values = JSON.parse(v.value)
        }
    }
    const [checked, setChecked] = useState(values.includes(option))
    return <div key={uuid()} className="grid grid-cols-[1fr_9fr] gap-2">
        <input id={`${option}_${index}`} readOnly={true} type="radio" name={element.name} value={option} checked={checked}></input>
        <label htmlFor={`${option}_${index}`}>{option}</label>
    </div>
}



export const getServerSideProps: GetServerSideProps<any, {
    formId: string
}> = async (context) => {
    if (context.params) {
        const formId = context.params.formId
        const token = context.req.cookies.token
        if (token) {
            const user = await userFromToken(token);
            if (user) {
                const prisma = new PrismaClient()
                const form = await prisma.form.findFirst({
                    where: { id: formId }, include: {
                        elements: {
                            include: {
                                values: true,
                                elOptions: true
                            }
                        }
                    }
                })
                if (form) {
                    if (form.ownerId == user.id) {
                        return {
                            props: {
                                formData: form
                            }
                        }
                    }
                    return {
                        props: {
                            error: "NO_AUTH"
                        }
                    }
                }
                return {
                    props: {
                        error: "INVALID_ID"
                    }
                }
            }

        }
    }
    return {
        props: {
            error: "NO_AUTH"
        }
    }
}