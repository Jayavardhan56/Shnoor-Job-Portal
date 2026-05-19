import {useEffect,useState} from "react";
import api, { API_URL } from "../../api";
import ManagerLayout from "../../layouts/ManagerLayout";
import {FaStar,FaUser,FaBriefcase,FaCommentDots,FaChartLine} from "react-icons/fa";

export default function UserRatings(){
  const[reviews,setReviews]=useState([]);
  const token=sessionStorage.getItem("token");
  useEffect(()=>{
    const fetchReviews=async()=>{
      try{
        const res=await api.get("/api/applications/reviews/");
        setReviews(res.data);
      }catch(err){}
    };
    fetchReviews();
  },[]);

  const getAvg=(field)=>{
    if(reviews.length===0)return 0;
    const sum=reviews.reduce((a,b)=>a+b[field],0);
    return(sum/reviews.length).toFixed(1);
  };

  const ChartBar=({label,field})=>(
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        <span>{label}</span> <span>{getAvg(field)}/10</span>
      </div>
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-teal-500 rounded-full transition-all duration-1000 shadow-lg shadow-teal-100" style={{width:`${getAvg(field)*10}%`}}></div>
      </div>
    </div>
  );

  return(
    <ManagerLayout>
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">Candidate Experience Analytics</h1>
        <p className="text-slate-500 font-medium text-sm mt-2 uppercase tracking-widest">Aggregate feedback across all recruitment pipelines</p>
      </div>
      <div className="grid lg:grid-cols-3 gap-10 mb-12">
        <div className="lg:col-span-1 bg-white p-10 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Global Satisfaction</p>
            <h2 className="text-4xl font-bold text-teal-600 tracking-tighter font-['Plus_Jakarta_Sans']">{getAvg('overall_rating')}<span className="text-2xl text-slate-300">/10</span></h2>
            <div className="flex justify-center gap-1 mt-4">
              {[1,2,3,4,5].map(n=><FaStar key={n} className={n<=Math.round(getAvg('overall_rating')/2)?"text-amber-400":"text-slate-100"}/>)}
            </div>
            <p className="text-slate-500 text-xs font-bold mt-6 uppercase tracking-widest">Based on {reviews.length} Candidate Reviews</p>
          </div>
        </div>
        <div className="lg:col-span-2 bg-white p-10 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl"><FaChartLine className="text-xl"/></div>
            <h3 className="text-xl font-bold text-slate-900 uppercase tracking-widest font-['Plus_Jakarta_Sans']">Performance Metrics</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            <ChartBar label="Technical Difficulty" field="technical_difficulty"/>
            <ChartBar label="Process Clarity" field="process_clarity"/>
            <ChartBar label="Interviewer Behavior" field="interviewer_behavior"/>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30">
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Individual Candidate Feedback</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {reviews.map(r=>(
            <div key={r.id} className="p-12 hover:bg-slate-50/50 transition-all group">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                <div className="flex gap-6">
                  <div className="w-16 h-16 bg-teal-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-xl shadow-teal-100 uppercase overflow-hidden">
                    {r.photo?<img src={`${API_URL}${r.photo}`} className="w-full h-full object-cover"/>:r.username[0]}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans']">{r.username}</h4>
                    <div className="flex items-center gap-2 text-teal-600 text-[11px] font-bold uppercase tracking-widest mt-1">
                      <FaBriefcase size={10}/> {r.job_title}
                    </div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase mt-2">{new Date(r.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 flex-1 max-w-3xl">
                  {[
                    {l:'Tech',v:r.technical_difficulty},
                    {l:'Clarity',v:r.process_clarity},
                    {l:'Behavior',v:r.interviewer_behavior},
                    {l:'Overall',v:r.overall_rating,high:true}
                  ].map((item,idx)=>(
                    <div key={idx} className={`p-4 rounded-2xl border ${item.high?'bg-slate-900 border-slate-900':'bg-slate-50 border-slate-100/50'}`}>
                      <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${item.high?'text-teal-400':'text-slate-400'}`}>{item.l}</p>
                      <p className={`text-sm font-bold ${item.high?'text-white':'text-slate-800'}`}>{item.v}/10</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-10 bg-slate-50/80 p-8 rounded-2xl border border-slate-100/50 relative">
                <FaCommentDots className="absolute -top-3 -left-3 text-teal-400 text-3xl bg-white rounded-full p-1 shadow-sm border border-slate-50"/>
                <p className="text-slate-600 text-sm font-bold italic leading-relaxed">"{r.text}"</p>
              </div>
            </div>
          ))}
          {reviews.length===0&&<p className="p-24 text-center text-slate-400 font-bold italic">No candidate feedback available yet.</p>}
        </div>
      </div>
    </ManagerLayout>
  );
}
