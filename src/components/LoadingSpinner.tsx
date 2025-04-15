import React from "react";

export default function LoadingSpinner() {
    return (
        <div className='flex space-x-2 justify-center items-center bg-white h-screen dark:invert'>
            <div className='h-8 w-8 bg-[#CAD9FC] rounded-full animate-bounce [animation-delay:-0.3s]' />
            <div className='h-8 w-8 bg-[#FCFFA2] rounded-full animate-bounce [animation-delay:-0.15s]' />
            <div className='h-8 w-8 bg-[#C8FBAF] rounded-full animate-bounce' />
        </div>
    );
}