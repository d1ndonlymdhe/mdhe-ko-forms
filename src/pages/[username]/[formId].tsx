import { PrismaClient } from "@prisma/client";
import { GetServerSideProps } from "next";
import { useState } from "react";
import uuid from "react-uuid";
import { form } from ".";
import Input from "../../components/Input";
import TopBar from "../../components/Topbar";
import Wrapper from "../../components/Wrapper";
import { formEl } from ".";
import Button from "../../components/Button";

type pageProps = {
    username: string,
    form: form
}
type element = formEl
export default function formRenderer(props: pageProps) {
    const { username, form } = props
    console.log(form)
    // return <div>{props.formId}</div>
    return <div className="grid grid-rows-[1fr_9fr] gap-2 bg-slate-500">
        <TopBar></TopBar>
        <div className="grid justify-center mx-2 mb-2">
            <div className="grid grid-flow-row gap-y-2">
                <Wrapper className="">
                    <div className="font-bold text-4xl h-fit">
                        <h1>{form.title}</h1>
                    </div>
                    <div className="h-fit">
                        <h2>{form.description}</h2>
                    </div>
                </Wrapper>
                <form className="grid grid-flow-row gap-y-2">
                    <Wrapper className="gap-y-4">
                        {
                            form.elements.map(element => {
                                if (element.type == "Text") {
                                    return <div className="grid grid-flow-row gap-2" key={uuid()}>
                                        <label htmlFor={element.name} className="sm:text-3xl text-xl font-bold">{element.label}</label>
                                        <Input id={element.name} type="text" defaultValue={element.default || ""} required={element.required}></Input>
                                    </div>
                                } else if (element.type == "Checkbox") {
                                    return <div className="grid grid-flow-row" key={uuid()}>
                                        <p className="sm:text-3xl text-xl font-bold">{element.label}</p>
                                        <div className="grid grid-flow-row gap-2">
                                            {
                                                element.elOptions && element.elOptions.map((option, index) => {
                                                    return <CustomFormCheckBox {...{ element, option: option.option, index }}></CustomFormCheckBox>
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
                                                    return <CustomFormRadio {...{ element, option: option.option, index }}></CustomFormRadio>
                                                })
                                            }
                                        </div>
                                    </div>
                                } else if (element.type == "Dropdown") {
                                    return <div className="grid grid-flow-col gap-2" key={uuid()}>
                                        <div className="grid grid-flow-row gap-2">
                                            <label htmlFor={element.name} className="sm:text-3xl text-xl font-bold">{element.label}</label>
                                            <select name={element.name} id={element.name} className="bg-pink-500 rounded-md px-2 py-1">
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
                    <Wrapper className="grid-flow-col hover:gap-x-4 gap-x-2">
                        <Button expand={true} type="submit" className="bg-green-400">Submit</Button>
                        <Button expand={true} type="reset" className="bg-teal-400">Reset</Button>
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
}
function CustomFormCheckBox(props: CustomFormCheckBoxProps) {
    const { element, option, index } = props
    const [checked, setChecked] = useState(element.default === option)
    return <div key={uuid()} className="grid grid-cols-[1fr_9fr] gap-2">
        <input id={`${option}_${index}`} type="checkbox" name={element.name} value={option} checked={checked} onChange={() => {
            setChecked(!checked)
        }}></input>
        <label htmlFor={`${option}_${index}`}>{option}</label>
    </div>
}
function CustomFormRadio(props: CustomFormCheckBoxProps) {
    const { element, option, index } = props
    const [checked, setChecked] = useState(element.default === option)
    return <div key={uuid()} className="grid grid-cols-[1fr_9fr] gap-2">
        <input id={`${option}_${index}`} type="checkbox" name={element.name} value={option} checked={checked} onChange={() => {
            setChecked(!checked)
        }}></input>
        <label htmlFor={`${option}_${index}`}>{option}</label>
    </div>
}

export const getServerSideProps: GetServerSideProps<any, {
    formId: string,
    username: string
}> = async (context) => {
    const { formId, username } = context.params!
    const token = context.req.cookies.token
    const prisma = new PrismaClient()
    const form = await prisma.form.findFirst({
        where: { id: formId }, include: {
            elements: {
                include: {
                    elOptions: true
                }
            }
        }
    })
    if (form) {
        return {
            props: {
                username: username,
                form: form,
                formId: formId
            }
        }
    }
    return {
        props: {
            formId: formId

        }
    }
}

