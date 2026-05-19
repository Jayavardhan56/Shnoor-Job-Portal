import {useEffect,useState} from "react";
import api from "../../api";
import UserLayout from "../../layouts/UserLayout";
import {FaBrain,FaChartLine,FaMagic,FaCheckCircle,FaExclamationTriangle,FaRocket,FaBriefcase} from "react-icons/fa";

export default function ResumeAi(){
  const[resumes,setResumes]=useState([]);
  const[selectedResume,setSelectedResume]=useState("");
  const[loading,setLoading]=useState(false);
  const[result,setResult]=useState(null);
  const token=sessionStorage.getItem("token");
  useEffect(()=>{fetchResumes();},[]);
  const fetchResumes=async()=>{
    try{
      const res=await api.get("/api/profile/resumes/",{headers:{Authorization:`Bearer ${token}`}});
      setResumes(res.data);
      if(res.data.length>0){setSelectedResume(res.data[0].id);}
    }catch(err){}
  };
  const analyzeResume=async()=>{
    if(!selectedResume){return alert("Please select a resume");}
    setLoading(true);
    try{
      const res=await api.post("/api/applications/ai-review/",{resume_id:selectedResume},{headers:{Authorization:`Bearer ${token}`}});
      setResult(res.data);
    }catch(err){alert("AI analysis failed");}
    finally{setLoading(false);}
  };
  return(
    <UserLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">Resume Intelligence</h1>
          <p className="text-slate-500 mt-2 text-base font-medium">Analyze your professional profile against current hiring trends on SHNOOR.</p>
        </div>
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-primary text-white flex items-center justify-center text-xl mb-6 shadow-lg shadow-teal-50"><FaBrain/></div>
              <h2 className="text-xl font-bold text-slate-900 mb-2 font-['Plus_Jakarta_Sans']">Analyzer</h2>
              <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">Select one of your stored resumes to begin a deep-dive diagnostic check.</p>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Stored Resumes</label>
                  <select value={selectedResume} onChange={(e)=>setSelectedResume(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-400 transition font-bold text-slate-700 text-base cursor-pointer">
                    {resumes.map(r=>(<option key={r.id} value={r.id}>{r.name}</option>))}
                  </select>
                </div>
                <button onClick={analyzeResume} disabled={loading} className="w-full py-5 bg-primary text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-secondary transition active:scale-95 disabled:opacity-50">
                  {loading?"Analyzing...":"Run Analysis"}
                </button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-8">
            {!result?(
              <div className="h-full min-h-[450px] border border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-12 bg-slate-50/50">
                <div className="text-center max-w-sm">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-slate-300 text-3xl mx-auto mb-6 shadow-sm"><FaMagic/></div>
                  <h3 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">Intelligence Ready</h3>
                  <p className="text-slate-500 mt-3 text-sm font-medium leading-relaxed">Select your resume to generate a suitability score and career roadmap.</p>
                </div>
              </div>
            ):(
              <div className="space-y-8">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-1 bg-teal-50 border border-teal-100 rounded-2xl p-8 text-teal-900 relative overflow-hidden">
                    <p className="text-xs uppercase tracking-widest font-bold text-teal-600 mb-4">Suitability Score</p>
                    <div className="flex items-end gap-3">
                      <h2 className="text-5xl font-bold text-teal-600 font-['Plus_Jakarta_Sans']">{result.ats_score}%</h2>
                      <FaChartLine className="text-teal-500 mb-3 text-2xl"/>
                    </div>
                  </div>
                  <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                    <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-4">Executive Summary</p>
                    <p className="text-slate-700 font-medium text-base leading-relaxed italic">"{result.career_summary}"</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center text-base shadow-lg shadow-teal-50"><FaCheckCircle/></div>
                      <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans']">Core Strengths</h3>
                    </div>
                    <ul className="space-y-4">
                      {result.strengths?.map((s,i)=>(<li key={i} className="flex items-start gap-4 text-slate-700 font-bold text-sm"><span className="text-teal-500 mt-1.5">•</span> {s}</li>))}
                    </ul>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-red-500 text-white flex items-center justify-center text-base shadow-lg shadow-red-50"><FaExclamationTriangle/></div>
                      <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans']">Critical Gaps</h3>
                    </div>
                    <ul className="space-y-4">
                      {result.missing_skills?.map((s,i)=>(<li key={i} className="flex items-start gap-4 text-slate-700 font-bold text-sm"><span className="text-red-500 mt-1.5">•</span> {s}</li>))}
                    </ul>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center text-base shadow-lg shadow-teal-50"><FaRocket/></div>
                    <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans']">Optimization Roadmap</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {result.resume_improvements?.map((tip,i)=>(<div key={i} className="p-6 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 font-bold text-sm leading-relaxed">{tip}</div>))}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center text-base shadow-lg shadow-teal-50"><FaBriefcase/></div>
                    <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans']">Target Role Mapping</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {result.recommended_roles?.map((role,i)=>(<span key={i} className="px-5 py-3 bg-teal-50 text-teal-700 rounded-xl text-xs font-bold uppercase tracking-widest border border-teal-100">{role}</span>))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
