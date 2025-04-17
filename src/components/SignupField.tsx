'use client'
import { useEffect, useState } from "react";
import { RedirectButton } from "./Buttons";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import "./styles.css";

function SignupField(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState(""); 
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const isValidEmail = (email : string) : boolean => {
        const atIndex = email.indexOf("@");
        if (atIndex == -1 || atIndex == 0 || atIndex == email.length - 1) {
          return false;
        }
        const domain = email.substring(atIndex + 1);
        const periodIndex = domain.indexOf(".");
        if (periodIndex == -1 || periodIndex == 0 || periodIndex == domain.length - 1) {
          return false;
        }
        return true;
    }

    const isValidPassword = (password : string) : boolean => {
        return (password.length >= 8 ? true : false);
    }

    const handleSignUp = async (email: string, password: string) => {
        setEmailError("");
        setPasswordError("");

        const validEmail = isValidEmail(email);
        const validPassword = isValidPassword(password);

        if (validEmail && validPassword) {
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
                
                if (error.message.includes("auth/email-already-in-use")) {
                    setEmailError("This email is already in use.");
                } else {
                    setEmailError("Signup failed. Please try again.");
                }
            }
        } else {
            setEmailError(validEmail ? "" : "Please enter a valid email.");
            setPasswordError(validPassword ? "" : "Please enter a password with 8+ characters.");
        }
    }

    return(
        <div className="login-container">
            <h1 className="login-title text-center font-medium text-[40px]">
                Sign up
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
            {emailError && <p className="text-red-500">{emailError}</p>}
            <h2 className="login-title text-center font-medium">
                Password
            </h2>
            <Input 
                type={showPassword == false ? "password" : "text"}
                placeholder="Enter password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-[300px] border border-gray-300 rounded-lg px-2 py-1"
            />
            {passwordError && <p className="text-red-500">{passwordError}</p>}
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
                    onClick={() => handleSignUp(email, password)}className="login-button bg-black text-white"
                >
                    Sign up
                </button>
                <RedirectButton
                    url="/login"
                    text="Log into an existing account"
                    className="login-button bg-gray-200 text-black"
                >
                </RedirectButton>
            </div>
        </div>
    )
}

function HandleCallback () {

    useEffect(() => {
        const handleImgurCallback = async () => {
            const fragment = new URLSearchParams(window.location.hash.substring(1));
            const refreshToken = fragment.get("refresh_token");
            const user = new URLSearchParams(window.location.search).get("state");

            if (refreshToken && user) {
                try {
                    const response = await fetch(`/api/auth/imgur-callback?access_token=${refreshToken}&state=${user}`);
                    if (response.ok) {
                        window.location.href = "/successfulSignup";
                    } else {
                        console.error("Imgur callback API call failed");
                    }
                } catch (error) {
                    console.error("An error occurred while handling the imgur callback: ", error);
                }
            } else {
                console.error("Missing access token or user state");
            }
        };

        handleImgurCallback();
    }, []);

    return (
        <></>
    )
}

export { SignupField, HandleCallback }