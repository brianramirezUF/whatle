'use client'
import { useState } from "react";
import { RedirectButton } from "./Buttons";
import { auth } from "@/config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

function LoginField() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (email: string, password: string) => {
        setError("");
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/');
        } catch (error: any) {
            setError(error.message);
            console.error("Login Error", error);
        }
    }

    return (
        <>
            <div>
                <input 
                    type="email" 
                    placeholder="Enter email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                />
            </div>
            <div>
                <input 
                    type="password" 
                    placeholder="Enter password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <button onClick={() => handleLogin(email, password)}>Login</button>
            <br></br>
            <RedirectButton url="/signup" text="Don't have an account? Signup here"></RedirectButton>
        </>
    )
}

export { LoginField }