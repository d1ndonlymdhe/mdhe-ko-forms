import { router, publicProcedure } from "../trpc"
import { z } from "zod"
import userFromToken from "../../../utils/userFromToken"
import { title } from "process"
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
                    if (element.options.elOptions) {
                        element.options.elOptions.forEach(async option => {
                            const newElementOptions = await ctx.prisma.elementOptions.create({
                                data: {
                                    option: option,
                                    elementId: newElement.id,
                                }
                            })
                        })
                    }
                })
                return {
                    status: "success",
                    data: {
                        formId: newForm.id
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
})