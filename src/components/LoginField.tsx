'use client'
import { auth } from "@/config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

function LoginField(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState(""); 

    const handleSignUp = async (email: string, password: string) => {
        try{
            const response = await fetch("/api/auth/signup", {
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

            console.log("Signup Success", data);

            console.log("Attempting imgur redirect...");

            if (data.imgurAuthUrl) {
                window.location.href = data.imgurAuthUrl;
            }

            console.log("Attempting to log in...");
            handleLogin(email, password);
        } catch (error: any) {
            console.error("Signup Error", error);

            if (error.message.includes("auth/email-already-in-use")) {
                console.log("Email already in use, attempting to log in...");
                handleLogin(email, password);
            }

        }
    }

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
            <button onClick={() => handleSignUp(email, password)}>Signup & Login</button>
        </>
    )
}

export { LoginField }