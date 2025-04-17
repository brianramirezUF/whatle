'use client'
import { useState, useEffect } from "react";
import { RedirectButton } from "./Buttons";
import { auth } from "@/config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import "./styles.css";

function LoginField() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleLogin = async (email: string, password: string) => {
        setError("");
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/');
        } catch (error: any) {
            setError("Invalid login, please try again.");
            console.error("Login Error", error);
        }
    }

    return (
        <div className="login-container">
            <h1 className="login-title text-center font-medium text-[40px]">
                Log in
            </h1>
            <h2 className="login-title text-center font-medium">
                Email
            </h2>
            <Input 
                type="email" 
                placeholder="Enter email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-[300px] border border-gray-300 rounded-lg px-2 py-1"
            />
            <h2 className="login-title  text-center font-medium">
                Password
            </h2>
            <Input 
                type={showPassword == false ? "password" : "text"}
                placeholder="Enter password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-[300px] border border-gray-300 rounded-lg px-2 py-1"
            />
            {error && <p className="text-red-500">{error}</p>}
            <div className="login-button-container">
                <Checkbox
                    id="show"
                    checked={showPassword}
                    onCheckedChange={(checked) => setShowPassword(Boolean(checked))}
                />
                <label
                    htmlFor="show"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 m-3"
                >
                    Show password
                </label>
            </div>
            <div className="login-button-container">
                <button
                    onClick={() => handleLogin(email, password)} className="login-button bg-black text-white"
                >
                    Log in
                </button>
                <RedirectButton
                    url="/signup"
                    text="Create an account"
                    className="login-button bg-gray-200 text-black"
                >
                </RedirectButton>
            </div>
        </div>
    )
}

function HandleCallback () {

    useEffect(() => {
        const fragment = new URLSearchParams(window.location.hash.substring(1));
        const refreshToken = fragment.get("refresh_token");
        const user = new URLSearchParams(window.location.search).get("state");

        if (refreshToken && user) {
            window.location.href = `/api/auth/imgur-callback?access_token=${refreshToken}&state=${user}`;
        } else {
            console.error("Missing access token or user state");
        }
    }, []);

    return (
        <></>
    )
}

export { LoginField, HandleCallback }