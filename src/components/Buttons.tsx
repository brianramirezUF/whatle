'use client'
import { useRouter } from "next/navigation";

function RedirectButton(props: { url: string, text: string}){
    const { url, text } = props;
    const router = useRouter();

    return(
        <button onClick={()=>router.push(url)}>{text}</button>
    )
}

export{ RedirectButton }