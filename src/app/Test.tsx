"use client"
import { useEffect } from "react";
import app from "@/config/firebase"

const test = () => {
  useEffect(() => {
    console.log(app);
  }, []);

  return (
    <div>
      <h1>Check your browser console!</h1>
    </div>
  );
};

export default test;