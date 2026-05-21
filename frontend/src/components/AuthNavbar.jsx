import {Link} from "react-router-dom";
import logo from "../assets/logo.png";
export default function AuthNavbar(){
  return(
    <div className="w-full bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-16 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
      <div className="flex items-center gap-2 text-center sm:text-left">
        <img src={logo} alt="Shnoor" className="h-8"/>
        <span className="font-semibold text-slate-800 text-base sm:text-lg tracking-tight">Shnoor Job Portal</span>
      </div>
      <Link to="/" className="text-sm text-slate-600 hover:text-teal-500 transition">← Back to Home</Link>
    </div>
  );
}
