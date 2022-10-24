import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser"
import util from "util"
export default function App(props: any) {
    console.log(props)
    return <div>Testing</div>
}
const getBody = util.promisify(bodyParser.urlencoded());
export const getServerSideProps = async (context: any) => {
    await getBody(context.req, context.res)
    if (context.params) {
        const { formId } = context.params
        const prisma = new PrismaClient()
        const form = await prisma.form.findFirst({ where: { id: formId }, include: { elements: true } })
        const formData = context.req.body
        if (form) {
            form.elements.forEach(async element => {
                const currentValue = await prisma.value.create({
                    data: {
                        elementId: element.id,
                        value: JSON.stringify(formData[element.name])
                    }
                })
            })
            return {
                redirect: {
                    permanent: false,
                    destination: `./${formId}/success`
                }
            }
        }
    }
    return {
        redirect: {
            permanent: false,
            destination: `/`
        }
    }
}
