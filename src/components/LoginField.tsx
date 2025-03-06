'use client'
import { useState } from "react";
import { RedirectButton } from "./Buttons";

function LoginField(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState(""); 

    const handleLogin = async (email: string, password: string) => {
        try{
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({ email, password }),
            });
    
            const data = await response.json();

            if (!response.ok){
                throw new Error(data.error);
            } 
            
            console.log("Login Success", data)
        } catch (error) {
            console.error("Login Error", error);
        }
    }

    return(
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
            <button onClick={() => handleLogin(email, password)}>Login</button>
            <br></br>
            <RedirectButton url="/signup" text="Don't have an account? Signup here"></RedirectButton>
        </>
    )
}

export { LoginField }