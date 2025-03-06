'use client'
import { useEffect, useState } from "react";
import { RedirectButton } from "./Buttons";

function SignupField(){
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
        } catch (error: any) {
            console.error("Signup Error", error);
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
            <button onClick={() => handleSignUp(email, password)}>Signup</button>
            <br></br>
            <RedirectButton url="/login" text="Already have an account? Login here"></RedirectButton>
        </>
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

export { SignupField, HandleCallback }