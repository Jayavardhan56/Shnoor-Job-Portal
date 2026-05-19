import {useState,useEffect} from "react";
import {useNavigate,Link} from "react-router-dom";
import api from "../../api";
import logo from "../../assets/logo.png";
import {FaArrowLeft,FaSun,FaMoon,FaLeaf,FaEye,FaEyeSlash} from "react-icons/fa";

export default function Login(){
  const navigate=useNavigate();
  const[form,setForm]=useState({email:"",password:""});
  const[loading,setLoading]=useState(false);
  const[showPassword,setShowPassword]=useState(false);
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
  const handleLogin=async()=>{
    if(!form.email||!form.password){return alert("All fields required");}
    setLoading(true);
    try{
      const res=await api.post("/api/login/",form);
      const{token,role,username,email}=res.data;
      sessionStorage.setItem("token",token);
      sessionStorage.setItem("role",role);
      sessionStorage.setItem("username",username);
      sessionStorage.setItem("email",email);
      if(role==="admin"){navigate("/admin");}
      else if(role==="manager"){navigate("/manager");}
      else{navigate("/user");}
    }catch(err){
      if(err.response?.status==403){alert("Waiting for admin approval");}
      else{alert("Invalid credentials");}
    }finally{setLoading(false);}
  };
  return(
    <div className="h-screen bg-white flex overflow-hidden relative">
      <button onClick={toggleTheme} className="absolute top-5 right-5 p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-500 hover:text-teal-600 transition z-50">
        {theme==="light"?<FaSun size={16}/>:<FaMoon size={16}/>}
      </button>
      <div className="hidden lg:flex lg:w-1/2 bg-slate-50 items-center justify-center p-16 border-r border-slate-100">
        <div className="max-w-md">
          <div className="p-2 rounded-xl border border-slate-200 inline-block mb-10" style={{backgroundColor:'#ffffff'}}>
            <img src={logo} alt="Shnoor" className="h-14 w-auto object-contain"/>
          </div>
          <h1 className="text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">SHNOOR <br/><span className="text-teal-600">Job Portal</span></h1>
          <p className="text-slate-600 text-lg font-medium leading-relaxed mb-10">Sign in to manage your professional journey. Apply to elite roles, track your application status, and engage with top recruiters.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-teal-600 font-bold text-2xl block mb-1">Direct</span>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Applications</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-teal-600 font-bold text-2xl block mb-1">Instant</span>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Notifications</p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-teal-600 transition-all text-xs uppercase tracking-widest mb-8">
            <FaArrowLeft size={10}/> Back to Home
          </Link>
          <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Login</h2>
            <p className="text-slate-500 font-medium text-base">Enter your credentials to access your dashboard.</p>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <input type="email" placeholder="name@email.com" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} className="w-full p-5 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-all text-base font-medium" style={{backgroundColor:theme==="dark"?"#121212":"#ffffff",color:theme==="dark"?"#ffffff":"#0f172a"}}/>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <input type={showPassword?"text":"password"} placeholder="••••••••" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} className="w-full p-5 pr-14 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-all text-base font-medium" style={{backgroundColor:theme==="dark"?"#121212":"#ffffff",color:theme==="dark"?"#ffffff":"#0f172a"}}/>
                <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition">
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-6 mb-10">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"/>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Keep me signed in</span>
            </label>
            <Link to="/forgot-password" className="text-xs font-bold text-teal-600 hover:text-teal-700 uppercase tracking-wider transition">Forgot Password?</Link>
          </div>
          <button onClick={handleLogin} disabled={loading} className="w-full py-5 bg-primary text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-secondary transition-all shadow-lg active:scale-95 disabled:opacity-50">
            {loading?"Signing in...":"Login"}
          </button>
          <div className="mt-10 text-center">
            <p className="text-base font-medium text-slate-500">Don't have an account? <Link to="/register" className="text-teal-600 font-bold hover:text-teal-700 transition ml-1">Register Now</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
