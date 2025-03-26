'use client'
import { useRouter } from "next/navigation";

function RedirectButton(props: { url: string, text: string, className: string}){
    const { url, text, className } = props;
    const router = useRouter();

    return(
        <button className={className} onClick={()=>router.push(url)}>{text}</button>
    )
}

export { RedirectButton };