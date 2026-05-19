import {useEffect,useState} from "react";
import api, { API_URL } from "../api";
import {FaStar,FaQuoteLeft} from "react-icons/fa";

export default function Reviews(){
  const[revs,setRevs]=useState([]);
  useEffect(()=>{
    const fetchRevs=async()=>{
      try{
        const res=await api.get("/api/applications/reviews/");
        const unique=[];const seen=new Set();
        for(const r of res.data){
          if(!seen.has(r.username)){unique.push(r);seen.add(r.username);}
        }
        setRevs(unique);
      }catch(err){}
    };
    fetchRevs();
  },[]);

  if(revs.length===0)return null;

  return(
    <section className="py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-24">
          <p className="text-teal-600 font-bold text-xs uppercase tracking-[5px] mb-4">Testimonials</p>
          <h2 className="text-5xl md:text-6xl font-bold text-slate-800 tracking-tight">Success Stories</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {revs.map(r=>(
            <div key={r.id} className="bg-slate-50/50 p-12 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-teal-100/30 transition-all duration-500 group">
              <FaQuoteLeft className="text-teal-200 text-4xl mb-6 group-hover:text-teal-500 transition-colors duration-500"/>
              <p className="text-slate-700 text-base font-bold italic leading-relaxed mb-10">"{r.text}"</p>
              <div className="flex items-center gap-1 mb-8">
                {[1,2,3,4,5,6,7,8,9,10].map(n=>(
                  <FaStar key={n} className={n<=r.overall_rating?'text-amber-400':'text-slate-200'} size={14}/>
                ))}
                <span className="ml-3 text-[10px] font-bold text-slate-400 uppercase tracking-[2px]">{r.overall_rating}/10</span>
              </div>
              <div className="flex items-center gap-5 pt-8 border-t border-slate-200/50">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center font-bold text-xl shadow-2xl shadow-slate-200 uppercase overflow-hidden border-2 border-white">
                  {r.photo?<img src={`${API_URL}${r.photo}`} className="w-full h-full object-cover"/>:r.username[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">{r.username}</h4>
                  <p className="text-teal-600 text-[10px] font-bold uppercase tracking-[2px] mt-1">{r.headline||r.job_title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
