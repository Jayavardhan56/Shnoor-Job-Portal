import {useEffect,useState} from "react";
import api from "../../api";
import UserLayout from "../../layouts/UserLayout";

export default function UserDashboard(){
  const[stats,setStats]=useState({applied:0,shortlisted:0,hired:0,rejected:0});
  const[recent,setRecent]=useState([]);
  const username=sessionStorage.getItem("username")||"User";
  useEffect(()=>{
    const fetchStats=async()=>{
      try{
        const token=sessionStorage.getItem("token");
        if(!token)return;
        const res=await api.get("/api/applications/user/",{headers:{Authorization:`Bearer ${token}`}});
        setRecent(res.data.slice(0,3));
        const s={applied:res.data.length,shortlisted:0,hired:0,rejected:0};
        res.data.forEach(a=>{
          if(a.status==='shortlisted')s.shortlisted++;
          else if(a.status==='hired')s.hired++;
          else if(a.status==='rejected')s.rejected++;
        });
        setStats(s);
      }catch(err){}
    };
    fetchStats();
  },[]);
  return(
    <UserLayout>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">Welcome, {username}</h1>
          <p className="text-slate-500 mt-2 text-base font-bold uppercase tracking-widest">Candidate Recruitment Pulse</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {[
          {label:"Applied",val:stats.applied,color:"text-slate-900",bg:"bg-white",border:"border-slate-200"},
          {label:"Shortlisted",val:stats.shortlisted,color:"text-teal-600",bg:"bg-white",border:"border-slate-200"},
          {label:"Hired",val:stats.hired,color:"text-teal-600",bg:"bg-white",border:"border-slate-200"},
          {label:"Rejected",val:stats.rejected,color:"text-red-500",bg:"bg-white",border:"border-slate-200"}
        ].map((s,i)=>(
          <div key={i} className={`${s.bg} p-8 rounded-2xl border ${s.border} shadow-sm`}>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4">{s.label}</p>
            <h2 className={`text-4xl font-bold ${s.color} tracking-tighter font-['Plus_Jakarta_Sans']`}>{s.val}</h2>
          </div>
        ))}
      </div>
      <div className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">Timeline Activity</h2>
          <button onClick={()=>window.location.href='/user/applications'} className="px-6 py-3 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-slate-100 transition shadow-sm border border-slate-200">View All History</button>
        </div>
        {recent.length===0?(
          <div className="py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500 text-base font-medium italic">No recent recruitment activity detected in your timeline.</p>
          </div>
        ):(
          <div className="space-y-6">
            {recent.map((a,i)=>(
              <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-8 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-white transition shadow-sm">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">{a.job_title}</h3>
                  <p className="text-slate-400 text-sm mt-2 font-bold uppercase tracking-wider">Application Status</p>
                </div>
                <span className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest ${a.status==='hired'?'bg-[#2E8B87] text-white':a.status==='shortlisted'?'bg-teal-500 text-white':a.status==='rejected'?'bg-red-50 text-red-600 border border-red-100':'bg-[#2E8B87] text-white'}`}>{a.status === 'pending' ? 'applied' : a.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
