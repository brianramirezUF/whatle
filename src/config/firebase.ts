import { initializeApp } from "firebase/app";

if(!process.env.firebase){
    throw new Error("Environment variables missing")
}

const env = JSON.parse(process.env.firebase);

console.error("TEST");

const firebaseConfig = {
    apiKey: env.apiKey,
    authDomain: env.authDomain,
    projectId: env.projectId,
    storageBucket: env.storageBucket,
    messageSenderId: env.messageSenderId,
    appId: env.appId,
    measurementId: env.measurementId,
};

const app = initializeApp(firebaseConfig);
export default app;