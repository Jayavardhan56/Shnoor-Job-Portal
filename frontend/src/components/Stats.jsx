import {useState,useEffect} from "react";
import api from "../api";

export default function Stats(){
  const [data,setData]=useState({users:0,jobs:0,apps:0,rate:98});

  useEffect(()=>{
    const fetchStats=async()=>{
      try{
        const res=await api.get("/api/analytics/public-stats/");
        setData(res.data);
      }catch(err){
        console.log(err);
      }
    };
    fetchStats();
  },[]);

  const stats=[
    {value:`${data.users}+`,label:"Active Talent"},
    {value:`${data.jobs}+`,label:"Roles Posted"},
    {value:`${data.apps}+`,label:"Applications"},
    {value:`${data.rate}%`,label:"Placement Rate"}
  ];

  return(
    <section id="stats" className="px-8 py-20 bg-[#F8FAFC] border-y border-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <p className="text-teal-700 font-bold text-[10px] uppercase tracking-[4px] mb-4">Platform Performance</p>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight">Our Ecosystem at a Glance</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {stats.map((item,idx)=>(
            <div key={idx} className="text-center">
              <h3 className="text-6xl font-black text-slate-900 mb-4 tracking-tighter">{item.value}</h3>
              <div className="w-12 h-1 bg-teal-500 mx-auto mb-4"></div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-[2px]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
