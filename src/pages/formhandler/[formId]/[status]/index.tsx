import { GetServerSideProps } from "next";
import Button from "../../../../components/Button";
import TopBar from "../../../../components/Topbar";

type PageProps = {
    formId: string,
    status: "success" | "error"
}

export default function StatusPage(props: PageProps) {
    const { formId, status } = props;
    if (formId && status) {
        if (status == "success") {
            return <div className="grid grid-rows-[1fr_9fr]">
                <TopBar></TopBar>
                <div className="grid grid-flow-row w-full h-full mx-2 my-1 items-center">
                    <span className="font-bold text-9xl text-gray-400">Form Successfully Submitted</span>
                    <div className="w-[98%] h-2 rounded-md  bg-gray-400"></div>
                    <a href="/"><span className="font-bold text-9xl text-gray-400 hover:text-purple-400">Create your own form</span></a>
                </div>
            </div>
        } else {
            return <div className="grid grid-rows-[1fr_9fr]">
                <TopBar></TopBar>
                <div className="w-full h-full mx-2 my-1">
                    <span className="font-bold text-9xl text-red-400">Error While Form Submission</span>
                    <div>
                        <a href={`/${formId}`}><Button expand={true} >Reload Form</Button></a>
                    </div>
                </div>
            </div>
        }
    }
}

export const getServerSideProps: GetServerSideProps<any, {
    formId: string,
    status: "success" | "error"
}> = async (context) => {
    if (context.params) {
        const { formId, status } = context.params
        if (status == "success") {
            return {
                props: {
                    status: "success",
                    formId: formId
                }
            }
        } else {
            return {
                props: {
                    status: "error",
                    formId: formId
                }
            }
        }
    } else {
        return {
            // redirect: {
            //     permanent: false,
            //     destination: "/"
            // }

            props: {
                status: "not error",
                formId: "abcd"
            }

        }
    }
}
