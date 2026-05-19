import {Link} from "react-router-dom";
import logo from "../assets/logo.png";
export default function AuthNavbar(){
  return(
    <div className="w-full bg-white border-b border-slate-200 px-6 md:px-16 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img src={logo} alt="Shnoor" className="h-8"/>
        <span className="font-semibold text-slate-800 text-lg tracking-tight">Shnoor Job Portal</span>
      </div>
      <Link to="/" className="text-sm text-slate-600 hover:text-teal-500 transition">← Back to Home</Link>
    </div>
  );
}
