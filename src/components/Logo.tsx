
import Image from "next/image";

const Logo = () => {
    return ( 
        <Image width={110} height={20} src="/logo.svg" alt="Logo" className="p-0"/>
);
}

export { Logo }