import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function (req: NextApiRequest, res: NextApiResponse) {
    const { formId } = req.query
    const formData = req.body
    if (typeof formId == "string") {
        const prisma = new PrismaClient()
        const form = await prisma.form.findFirst({
            where: { id: formId }, include: {
                elements: true
            }
        })
        if (form) {
            form.elements.forEach(async element => {
                // const recieveValue:any = f
                console.log(formData[element.name])
            })
        }
    }
    res.json({ error: "" })
}