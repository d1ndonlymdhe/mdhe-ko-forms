import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRef, useState } from "react";
import { trpc } from "../utils/trpc";
import Input from "../components/Input"
import Button from "../components/Button";
import Error from "../components/Error"
import Cookies from "js-cookie"
import { PrismaClient } from "@prisma/client";
const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Mdhe Ko Forms</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
          Mdhe <span className="text-purple-300">Ko</span> Forms
        </h1>
        <AuthComponent></AuthComponent>
      </main>
    </>
  );
};

function AuthComponent() {
  const [currentForm, setCurrentForm] = useState("login");
  return <div className="grid grid-rows-[9fr_1fr] justify-items-center">
    <div>
      {currentForm == "login" && <LoginForm></LoginForm>}
      {currentForm == "signup" && <SignupForm></SignupForm>}
    </div>
    <div>
      <Button className="bg-blue-400" onClick={() => { setCurrentForm(currentForm == "login" ? "signup" : "login") }}>{currentForm == "login" ? "No Account? Sign Up" : "Already Have an Account? Login"}</Button>
    </div>
  </div>
}
function SignupForm() {
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState("")
  const signupMutation = trpc.auth.signUp.useMutation({
    onSuccess: (data) => {
      const status = data.status
      const message = data.message
      if (status == "success") {
        console.log("Successfully signed up")
        window.location.reload()
      } else {
        if (message == "NO_USERNAME_PASSWORD") {
          setError("Username and Password not provided")
        } else if (message == "USER_ALREADY_EXISTS") {
          setError("Username taken, try again with new credentials")
          if (usernameRef.current && passwordRef.current && confirmPasswordRef.current) {
            usernameRef.current.value = ""
            passwordRef.current.value = ""
            confirmPasswordRef.current.value = ""
          }
        } else {
          setError("Unknown error occured")
        }
      }
    },
    onError: () => {
      setError("Cannot connect to the server")
    }
  })

  const handleSignup = () => {
    if (usernameRef && passwordRef && confirmPasswordRef) {
      const username = usernameRef.current?.value
      const password = passwordRef.current?.value
      const confirmPassword = confirmPasswordRef.current?.value
      if (username && username !== "" && password && password != "" && confirmPassword && confirmPassword === password) {
        signupMutation.mutate({ username, password })
      }
    }
  }
  return <div className="border-2 border-solid border-gray-300 p-5 rounded-lg">
    <form className={`grid ${error !== "" ? "grid-rows-[repeat(8, 1fr)]" : "grid-rows-[repeat(7, 1fr)]"}`} onSubmit={(e) => {
      e.preventDefault()
      handleSignup()
    }}>
      {error !== "" && <Error>{error}</Error>}
      <label htmlFor="username">Username:</label>
      <Input name="username" id="username" type="text" ref={usernameRef} expand={true}></Input>
      <label htmlFor="password">Password:</label>
      <Input name="password" id="password" type="password" ref={passwordRef} minLength={8} expand={true}></Input>
      <label htmlFor="confirmPassword">Confirm Password:</label>
      <Input name="confirmPassword" id="confirmPassword" type="password" ref={confirmPasswordRef} minLength={8} expand={true}></Input>
      <Button type="submit" className={`mt-2 ${signupMutation.isLoading ? "bg-orange-300" : ""}`} expand={true}>{signupMutation.isLoading ? "Loading" : "Sign Up"}</Button>
    </form>
  </div>
}
function LoginForm() {
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState("");
  const loginMutaion = trpc.auth.logIn.useMutation({
    onSuccess: (data) => {
      const response = data
      if (response.status == "success") {
        Cookies.set("token", response.message)
        window.location.reload()
      } else {
        if (response.message == "NO_USER") {
          setError("No Account Found")
        } else if (response.message == "WRONG_PASSWORD") {
          setError("Wrong Password try again");
          if (passwordRef.current) {
            passwordRef.current.value = ""
          }
        } else {
          setError("Unknown Error Occured")
        }
      }
    },
    onError:
      () => {
      setError("Cannot connect to the server")
    }
  })
  const handleLogin = () => {
    if (usernameRef && passwordRef) {
      const username = usernameRef.current?.value
      const password = passwordRef.current?.value
      if (username && username !== "" && password && password != "") {
        loginMutaion.mutate({ username, password })
      }
    }
  }
  return <>
    <div className="border-2 border-solid border-gray-300 p-5 rounded-lg">
      <form name="loginForm" onSubmit={(e) => {
        e.preventDefault()
        handleLogin()
      }} className={`grid ${(error !== "") ? "grid-rows-6" : "grid-rows-5"}`}>
        {error !== "" && <Error>{error}</Error>}
        <label htmlFor="username">
          Username:
        </label>
        <Input name="username" type="text" id="username" ref={usernameRef} required={true} expand={true}></Input>
        <label htmlFor="password">
          Password:
        </label>
        <Input name="password" id="password" type={"password"} minLength={8} ref={passwordRef} required={true} expand={true}></Input>
        <Button id="submit" type="submit" className={`mt-2 ${loginMutaion.isLoading ? "bg-orange-300" : ""}`}>{loginMutaion.isLoading ? "Loading" : "Login"}</Button>
      </form>
    </div>
  </>
}
export default Home;
export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = context.req.cookies.token
  const prisma = new PrismaClient()
  if (token) {
    const tokenInfo = await prisma.userToken.findFirst({ where: { value: token } })
    if (tokenInfo) {
      const user = await prisma.user.findFirst({ where: { id: tokenInfo.userId } });
      if (user) {
        return {
          redirect: {
            permanent: false,
            destination: `/${user.username}`
          }
        }
      }
    }
  }
  return {
    props: {
    }
  }
}