'use client'

import { useEffect, useState } from "react";

function SuccessfulSignup() {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown(prevCountdown => {
                if (prevCountdown <= 1) {
                    clearInterval(interval);
                    window.location.href = "/login";
                    return 0;
                }
                return prevCountdown - 1;
            });
        }, 1000);

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);

    return (
        <div className="success-container">
            <h1 className="text-center font-medium text-[40px]">
                Signup Successful
            </h1>
            <p className="text-center font-medium text-[20px]">
                Redirecting in {countdown} seconds...
            </p>
        </div>
    );
}

export default SuccessfulSignup;