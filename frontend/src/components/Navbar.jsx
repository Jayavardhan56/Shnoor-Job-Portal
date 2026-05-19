import {useState,useEffect} from "react";
import {Link} from "react-router-dom";
import logo from "../assets/logo.png";
import {FaSun,FaMoon,FaLeaf} from "react-icons/fa";
export default function Navbar(){
  const[theme,setTheme]=useState(localStorage.getItem("theme")||"light");
  const toggleTheme=()=>{
    const next=theme==="light"?"dark":"light";
    setTheme(next);
    localStorage.setItem("theme",next);
    document.documentElement.setAttribute("data-theme",next);
  };
  useEffect(()=>{
    document.documentElement.setAttribute("data-theme",theme);
  },[theme]);
  return(
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 px-8 py-5">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <div className="p-1 rounded-lg border border-slate-200 inline-block" style={{backgroundColor:'#ffffff'}}>
            <img src={logo} alt="Shnoor" className="h-9 w-auto object-contain"/>
          </div>
          <span className="text-2xl font-extrabold text-slate-800 tracking-tighter">Shnoor <span className="text-teal-500 font-medium text-lg ml-1">Job Portal</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-10">
          <a href="/#home" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition tracking-wide uppercase">Home</a>
          <a href="/#features" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition tracking-wide uppercase">Features</a>
          <a href="/#how" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition tracking-wide uppercase">Workflow</a>
          <a href="/#stats" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition tracking-wide uppercase">Stats</a>
          <a href="/#contact" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition tracking-wide uppercase">Contact</a>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={toggleTheme} className="p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-500 hover:text-teal-600 transition">
            {theme==="light"?<FaSun size={16}/>:<FaMoon size={16}/>}
          </button>
          <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition uppercase tracking-widest">Log in</Link>
          <Link to="/register" className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-[3px] hover:bg-secondary transition-all shadow-lg shadow-teal-100">Sign up</Link>
        </div>
      </div>
    </nav>
  );
}
