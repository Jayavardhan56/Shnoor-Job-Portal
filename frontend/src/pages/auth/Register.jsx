import {useState,useEffect} from "react";
import {Link,useNavigate} from "react-router-dom";
import api from "../../api";
import logo from "../../assets/logo.png";
import {FaArrowLeft,FaSun,FaMoon,FaLeaf,FaEye,FaEyeSlash} from "react-icons/fa";

export default function Register(){
  const navigate=useNavigate();
  const[form,setForm]=useState({name:"",email:"",password:"",role:"user",organization_name:""});
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
  const handleRegister=async()=>{
    if(!form.name||!form.email||!form.password||(form.role==="manager"&&!form.organization_name)){return alert("All fields required");}
    setLoading(true);
    try{
      const res=await api.post("/api/register/",form);
      alert(res.data.message);
      navigate("/login");
    }catch(err){alert(err.response?.data?.error||"Registration failed");}
    finally{setLoading(false);}
  };
  return(
    <div className="min-h-screen bg-white flex relative">
      <button onClick={toggleTheme} className="absolute top-5 right-5 p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-500 hover:text-teal-600 transition z-50">
        {theme==="light"?<FaSun size={16}/>:<FaMoon size={16}/>}
      </button>
      <div className="hidden md:flex md:w-1/2 bg-slate-50 items-center justify-center p-8 xl:p-16 border-r border-slate-100">
        <div className="max-w-md">
          <div className="p-2 rounded-xl border border-slate-200 inline-block mb-10" style={{backgroundColor:'#ffffff'}}>
            <img src={logo} alt="Shnoor" className="h-14 w-auto object-contain"/>
          </div>
          <h1 className="text-4xl xl:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">SHNOOR <br/><span className="text-teal-600">Job Portal</span></h1>
          <p className="text-slate-600 text-base xl:text-lg font-medium leading-relaxed mb-10">Create your account to start your recruitment journey. SHNOOR connects talented professionals with industry-leading managers.</p>
          <div className="space-y-4">
            <div className="flex items-center gap-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-black text-sm">01</div>
              <p className="text-slate-700 font-bold text-base tracking-tight">Join Premium Network</p>
            </div>
            <div className="flex items-center gap-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-black text-sm">02</div>
              <p className="text-slate-700 font-bold text-base tracking-tight">Smart Career Tracking</p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-white">
        <div className="w-full max-w-sm">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-teal-600 transition-all text-xs uppercase tracking-widest mb-8">
            <FaArrowLeft size={10}/> Back to Home
          </Link>
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 tracking-tight">Register</h2>
            <p className="text-slate-500 font-medium text-base">Fill in the details to create your profile.</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <input type="text" placeholder="John Doe" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-all text-base font-medium" style={{backgroundColor:theme==="dark"?"#121212":"#ffffff",color:theme==="dark"?"#ffffff":"#0f172a"}}/>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <input type="email" placeholder="name@email.com" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-all text-base font-medium" style={{backgroundColor:theme==="dark"?"#121212":"#ffffff",color:theme==="dark"?"#ffffff":"#0f172a"}}/>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Select Role</label>
              <select value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})} className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-all text-base font-bold cursor-pointer" style={{backgroundColor:theme==="dark"?"#121212":"#ffffff",color:theme==="dark"?"#ffffff":"#0f172a"}}>
                <option value="user">Candidate / Job Seeker</option>
                <option value="manager">Hiring Manager</option>
              </select>
            </div>
            {form.role==="manager"&&(
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Organization Name</label>
                <input type="text" placeholder="Your Company Name" value={form.organization_name} onChange={(e)=>setForm({...form,organization_name:e.target.value})} className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-all text-base font-medium" style={{backgroundColor:theme==="dark"?"#121212":"#ffffff",color:theme==="dark"?"#ffffff":"#0f172a"}}/>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <input type={showPassword?"text":"password"} placeholder="••••••••" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} className="w-full p-4 pr-12 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-all text-base font-medium" style={{backgroundColor:theme==="dark"?"#121212":"#ffffff",color:theme==="dark"?"#ffffff":"#0f172a"}}/>
                <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition">
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>
          </div>
          <button onClick={handleRegister} disabled={loading} className="w-full py-4 sm:py-5 bg-primary text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-secondary transition-all shadow-lg active:scale-95 disabled:opacity-50 mt-8">
            {loading?"Creating Profile...":"Register"}
          </button>
          <div className="mt-8 text-center">
            <p className="text-base font-medium text-slate-500">Already a member? <Link to="/login" className="text-teal-600 font-bold hover:text-teal-700 transition ml-1">Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
