import { PrismaClient } from "@prisma/client";
import { GetServerSideProps } from "next";

export default function formRenderer(props: any) {
    console.log(props)
    return <div>
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
            textFields: {
                include: {
                    elOptions: true
                }
            }
        }
    })
    if (form) {
        return {
            props: {
                form: form
            }
        }
    }
    return {
        props: {

        }
    }
}

