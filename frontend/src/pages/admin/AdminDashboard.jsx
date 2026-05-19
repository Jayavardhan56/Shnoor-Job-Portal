import {useEffect,useState} from "react";
import api from "../../api";
import {AreaChart,Area,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,BarChart,Bar,PieChart,Pie,Cell} from 'recharts';
import AdminLayout from "../../layouts/AdminLayout";

const CustomTooltip=({active,payload,label})=>{
  if(active&&payload&&payload.length){
    return(
      <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-bold text-slate-900">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard(){
  const[stats,setStats]=useState({total_users:0,total_jobs:0,total_apps:0,total_hires:0,growth:[],trends:[],top_skills:{}});
  useEffect(()=>{
    const fetchStats=async()=>{
      try{
        const token=sessionStorage.getItem("token");
        if(!token)return;
        const res=await api.get("/api/analytics/stats/",{headers:{Authorization:`Bearer ${token}`}});
        setStats(res.data);
      }catch(err){
        console.log(err);
      }
    };
    fetchStats();
  },[]);

  const skillData=Object.entries(stats.top_skills).map(([name,value])=>({name,value}));
  const COLORS=['#0d9488','#0f766e','#115e59','#14b8a6','#2dd4bf'];

  return(
    <AdminLayout>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">System Intelligence</h1>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-[2px] font-medium">Real-time Platform Performance</p>
        </div>
      </div>
      <div className="grid md:grid-cols-4 gap-8 mb-12">
        {[
          {label:"Global Users",val:stats.total_users,icon:"👥"},
          {label:"Active Postings",val:stats.total_jobs,icon:"💼"},
          {label:"Total Intent",val:stats.total_apps,icon:"📝"},
          {label:"Successful Hires",val:stats.total_hires,icon:"✅"}
        ].map((s,i)=>(
          <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</span>
            </div>
            <p className="text-4xl font-bold text-slate-900 tracking-tighter font-['Plus_Jakarta_Sans']">{s.val}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-10 mb-10">
        <div className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold mb-10 text-slate-900 tracking-tight flex items-center gap-2 font-['Plus_Jakarta_Sans']">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span> Monthly Platform Growth
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.growth}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)"/>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:10}} tickFormatter={(str)=>new Date(str).toLocaleDateString('en-US',{month:'short'})}/>
                <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:10}}/>
                <Tooltip content={<CustomTooltip/>} cursor={false}/>
                <Area type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold mb-10 text-slate-900 tracking-tight flex items-center gap-2 font-['Plus_Jakarta_Sans']">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span> Manager Performance
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)"/>
                <XAxis dataKey="created_by__username" axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:10}}/>
                <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:10}}/>
                <Tooltip content={<CustomTooltip/>} cursor={false}/>
                <Bar dataKey="apps" fill="#64748b" radius={[10,10,0,0]} barSize={20}/>
                <Bar dataKey="hires" fill="#14b8a6" radius={[10,10,0,0]} barSize={20}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold mb-10 text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">Demand Intelligence</h2>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={skillData} innerRadius={80} outerRadius={100} paddingAngle={8} dataKey="value">
                    {skillData.map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} stroke="none"/>)}
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {skillData.map((s,i)=>(
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor:COLORS[i%COLORS.length]}}></div>
                    <span className="text-sm font-bold text-slate-700">{s.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{s.value} Postings</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-teal-500 p-10 rounded-2xl border border-teal-100 flex flex-col justify-center items-center text-center relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-40 h-40 bg-teal-200/20 rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <h2 className="text-sm font-bold mb-6 text-teal-100 tracking-[4px] uppercase">Efficiency</h2>
            <p className="text-7xl font-bold tracking-tighter mb-4 text-white">
              {stats.total_apps?Math.floor((stats.total_hires/stats.total_apps)*100):0}%
            </p>
            <p className="text-teal-100 text-xs font-bold uppercase tracking-widest">Hiring Success Rate</p>
            <div className="mt-10 pt-10 border-t border-teal-400">
              <p className="text-xs text-teal-100 leading-relaxed">Platform conversion from intent to successful placement across all sectors.</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
