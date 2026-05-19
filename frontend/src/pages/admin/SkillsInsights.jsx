import {useEffect,useState} from "react";
import api from "../../api";
import AdminLayout from "../../layouts/AdminLayout";

export default function SkillsInsights(){
  const[skills,setSkills]=useState([]);
  const token=sessionStorage.getItem("token");
  useEffect(()=>{
    const fetch=async()=>{
      try{
        const res=await api.get("/api/analytics/stats/",{headers:{Authorization:`Bearer ${token}`}});
        const data=Object.entries(res.data.top_skills).map(([name,count])=>({name,count}));
        setSkills(data);
      }catch(err){}
    };
    fetch();
  },[]);

  return(
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">Skill Intelligence</h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">Real-time demand analysis across all job postings</p>
      </div>
      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-8 bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-8 font-['Plus_Jakarta_Sans']">Top Demanded Skills</h2>
          <div className="space-y-6">
            {skills.map((s,i)=>(
              <div key={i}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-900">{s.name}</span>
                  <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">{s.count} Postings</span>
                </div>
                <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{width:`${Math.min(100,(s.count/Math.max(...skills.map(x=>x.count)))*100)}%`}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-4 space-y-6">
          <div className="bg-teal-500 p-8 rounded-2xl text-white shadow-xl shadow-teal-100">
            <h3 className="text-teal-100 text-xs font-bold uppercase tracking-widest mb-2">Primary Focus</h3>
            <p className="text-3xl font-bold">{skills[0]?.name||"N/A"}</p>
            <p className="text-teal-100 text-sm mt-4">This skill is currently appearing in {((skills[0]?.count/skills.reduce((a,b)=>a+b.count,0))*100).toFixed(1)}% of total requirements.</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Trending Tags</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((s,i)=>(
                <span key={i} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">{s.name}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
