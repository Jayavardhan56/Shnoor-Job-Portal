import {useState,useEffect} from "react";
import {useNavigate,Link} from "react-router-dom";
import api from "../../api";
import logo from "../../assets/logo.png";
import {FaArrowLeft,FaSun,FaMoon,FaEye,FaEyeSlash} from "react-icons/fa";

export default function ForgotPassword(){
  const navigate=useNavigate();
  const[form,setForm]=useState({email:"",password:"",confirmPassword:""});
  const[loading,setLoading]=useState(false);
  const[showPassword,setShowPassword]=useState(false);
  const[showConfirmPassword,setShowConfirmPassword]=useState(false);
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

  const handleSubmit=async()=>{
    if(!form.email||!form.password||!form.confirmPassword){
      return alert("All fields are required");
    }
    if(form.password!==form.confirmPassword){
      return alert("Passwords do not match");
    }
    setLoading(true);
    try{
      const res=await api.post("/api/forgot-password/", {
        email: form.email,
        password: form.password
      });
      alert(res.data.message || "Password reset request submitted. Please wait for admin approval.");
      navigate("/login");
    }catch(err){
      alert(err.response?.data?.error || "Failed to submit request. Please try again.");
    }finally{
      setLoading(false);
    }
  };

  return(
    <div className="min-h-screen bg-white flex relative">
      <button onClick={toggleTheme} className="absolute top-5 right-5 p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-500 hover:text-teal-600 transition z-50">
        {theme==="light"?<FaSun size={16}/>:<FaMoon size={16}/>}
      </button>
      <div className="hidden lg:flex lg:w-1/2 bg-slate-50 items-center justify-center p-16 border-r border-slate-100">
        <div className="max-w-md">
          <div className="p-2 rounded-xl border border-slate-200 inline-block mb-10" style={{backgroundColor:'#ffffff'}}>
            <img src={logo} alt="Shnoor" className="h-14 w-auto object-contain"/>
          </div>
          <h1 className="text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">SHNOOR <br/><span className="text-teal-600">Job Portal</span></h1>
          <p className="text-slate-600 text-lg font-medium leading-relaxed mb-10">Forgot your password? No worries. Submit a request with your email and desired new password. Once our administrator approves it, your password will be updated.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-teal-600 font-bold text-2xl block mb-1">Secure</span>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Verification</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-teal-600 font-bold text-2xl block mb-1">Admin</span>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Approval</p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-teal-600 transition-all text-xs uppercase tracking-widest mb-8">
            <FaArrowLeft size={10}/> Back to Login
          </Link>
          <div className="mb-8">
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Forgot Password</h2>
            <p className="text-slate-500 font-medium text-base">Request a password reset from the administrator.</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <input type="email" placeholder="name@email.com" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-all text-base font-medium" style={{backgroundColor:theme==="dark"?"#121212":"#ffffff",color:theme==="dark"?"#ffffff":"#0f172a"}}/>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</label>
              <div className="relative">
                <input type={showPassword?"text":"password"} placeholder="••••••••" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} className="w-full p-4 pr-12 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-all text-base font-medium" style={{backgroundColor:theme==="dark"?"#121212":"#ffffff",color:theme==="dark"?"#ffffff":"#0f172a"}}/>
                <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition">
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
              <div className="relative">
                <input type={showConfirmPassword?"text":"password"} placeholder="••••••••" value={form.confirmPassword} onChange={(e)=>setForm({...form,confirmPassword:e.target.value})} className="w-full p-4 pr-12 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-all text-base font-medium" style={{backgroundColor:theme==="dark"?"#121212":"#ffffff",color:theme==="dark"?"#ffffff":"#0f172a"}}/>
                <button type="button" onClick={()=>setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition">
                  {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading} className="w-full py-5 bg-primary text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-secondary transition-all shadow-lg active:scale-95 disabled:opacity-50 mt-8">
            {loading?"Submitting Request...":"Request Reset"}
          </button>
        </div>
      </div>
    </div>
  );
}
