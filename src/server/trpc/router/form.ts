import { router, publicProcedure } from "../trpc"
import { z } from "zod"
import userFromToken from "../../../utils/userFromToken"
import { PrismaClient } from "@prisma/client"
const formOptions = z.object({
    name: z.string(),
    elOptions: z.array(z.string()).optional(),
    defaultValue: z.string().optional(),
    required: z.boolean().optional(),
    label: z.string(),
    key: z.string()
})
const formElement = z.object({
    type: z.union([z.literal("Text"), z.literal("Radio"), z.literal("Checkbox"), z.literal("Dropdown")]),
    options: formOptions
})
const formObject = z.object({
    elements: z.array(formElement),
    title: z.string(),
    description: z.string()
})
export const formRouter = router({
    createForm: publicProcedure.input(formObject).mutation(async ({ input, ctx }) => {
        const token = ctx.req?.cookies.token
        console.log(token)
        if (token) {
            const user = await userFromToken(token)
            if (user) {
                const newForm = await ctx.prisma.form.create({ data: { ownerId: user.id, title: input.title, description: input.description } })
                let elementCount = 0;
                input.elements.forEach(async element => {
                    const newElement = await ctx.prisma.formElement.create({
                        data: {
                            type: element.type,
                            label: element.options.label,
                            key: element.options.key,
                            name: element.options.name,
                            default: element.options.defaultValue,
                            formId: newForm.id,
                            required: element.options.required
                        }
                    })
                    elementCount++;
                    if (element.options.elOptions) {
                        element.options.elOptions.forEach(async option => {
                            const elOptions = await ctx.prisma.elementOptions.create({
                                data: {
                                    option: option,
                                    elementId: newElement.id,
                                }
                            })
                        })
                    }
                })
                const form = await ctx.prisma.form.findFirst({ where: { id: newForm.id } })
                return {
                    status: "success",
                    data: {
                        formId: newForm.id,
                        form: form,
                        elementCount: elementCount
                    }
                }
            } else {
                return {
                    status: "error",
                    data: {
                        error: "NO_AUTH"
                    }
                }
            }
        } else {
            return {
                status: "error",
                data: {
                    error: "NO_AUTH"
                }
            }
        }
    })
    ,
    deleteForm: publicProcedure.input(z.object({ formId: z.string() })).mutation(async ({ input, ctx }) => {
        const token = ctx.req.cookies.token
        const user = await userFromToken(token);
        if (user) {
            const prisma = new PrismaClient()
            const formId = input.formId
            const form = await prisma.form.delete({ where: { id: formId } })
            if (form) {
                return {
                    status: "success"
                }
            } else {
                return {
                    status: "error",
                    message: "NO_FORM"
                }
            }
        } else {
            return {
                status: "error",
                message: "NO_AUTH"
            }
        }

    })
})