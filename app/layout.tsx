import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"Tallynest · Business books, made clear",description:"Your sales, stock and cash flow, in one clear workspace.",manifest:"/manifest.webmanifest",appleWebApp:{capable:true,title:"Tallynest",statusBarStyle:"default"},icons:{icon:"/icon.svg",apple:"/apple-touch-icon.png"}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
