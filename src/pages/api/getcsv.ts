import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import Papa from "papaparse";
import userFromToken from "../../utils/userFromToken";

export default async function getCsv(req: NextApiRequest, res: NextApiResponse) {
    const token = req.cookies.token
    const formId: string = req.body.formId
    if (token && formId) {
        const prisma = new PrismaClient()
        const user = await userFromToken(token);
        if (user) {
            const form = await prisma.form.findFirst({
                where: { id: formId }, include: {
                    elements: {
                        include: {
                            values: true
                        }
                    }
                }
            })
            if (form && form.ownerId == user.id) {
                const names: string[] = []
                const data: string[][] = []
                const elements = form.elements;
                elements.forEach(element => {
                    names.push(element.name);
                    // const values:string[] = []
                    const values: string[] = []
                    element.values.forEach(value => {
                        values.push(JSON.parse(value.value))
                    })
                    data.push(values)
                })

                res.send(Papa.unparse({ fields: names, data: transpose(data) }))
            }
        }
    }
}
function transpose<T>(arr: T[][]) {
    const retArr: T[][] = [];
    const A = arr[0]
    if (A) {
        for (let i = 0; i < A.length; i++) {
            const tempArr: T[] = []
            for (let j = 0; j < arr.length; j++) {
                const B = arr[j]
                if (B) {
                    const C = B[i]
                    if (C) {
                        tempArr.push(C)
                    }
                }
            }
            retArr.push(tempArr)
        }
    }
    return retArr
}