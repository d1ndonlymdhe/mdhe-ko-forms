import { GetServerSideProps } from "next";
import { PrismaClient } from "@prisma/client";
import { Bars3Icon, UserCircleIcon } from "@heroicons/react/24/solid"
import Button from "../../components/Button";
type PageProps = {
    username: string
}

export default function Dashboard(pageProps: PageProps) {
    return <>
        <div>
            <TopBar></TopBar>
            <div>
                <div>Your Forms</div>
                <div>List Forms Here</div>
                <Button>Create New Form</Button>
            </div>
        </div>
    </>
}

function TopBar() {
    return <header className="bg-purple-600 text-white flex items-center justify-between px-4 py-2">
        <Bars3Icon className="w-10 h-10 hover:cursor-pointer" ></Bars3Icon>
        <span className="text-3xl font-extrabold leading-normal text-gray-700 lg:text-5xl md:text-5xl sm:text-5xl ">
            Mdhe <span className="text-purple-300">Ko</span> Forms
        </span>
        <UserCircleIcon className="w-10 h-10 hover:cursor-pointer"></UserCircleIcon>
    </header>
}

export const getServerSideProps: GetServerSideProps<any, { username: string }> = async (context) => {
    const token = context.req.cookies.token
    const prisma = new PrismaClient()
    const { username: reqUsername } = context.params!
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