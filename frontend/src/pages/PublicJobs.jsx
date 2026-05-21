import {useState,useEffect} from "react";
import api from "../api";
import {Link} from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {FaSearch,FaBriefcase,FaMoneyBillWave,FaClock} from "react-icons/fa";

export default function PublicJobs(){
  const [jobs,setJobs]=useState([]);
  const [query,setQuery]=useState("");

  const fetchJobs=async()=>{
    try{
      const res=await api.get(`/api/jobs/all/?q=${query}`);
      setJobs(res.data);
    }catch(err){
      console.error(err);
    }
  };

  useEffect(()=>{
    fetchJobs();
  },[query]);

  return(
    <div className="bg-[#F8FAFC] min-h-screen">
      <Navbar/>
      <div className="pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4 font-['Plus_Jakarta_Sans']">Explore Opportunities</h1>
          <p className="text-slate-500 text-base sm:text-lg font-medium">Find your next career move in our curated list of professional roles.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12 max-w-3xl mx-auto">
          <div className="flex-1 flex items-center gap-3 px-4">
            <FaSearch className="text-slate-400"/>
            <input type="text" placeholder="Search by title, skills, or company..." className="w-full py-3 outline-none text-slate-700 font-medium" value={query} onChange={(e)=>setQuery(e.target.value)}/>
          </div>
          <button className="bg-primary text-white w-full sm:w-auto px-6 sm:px-8 py-3 rounded-2xl font-bold hover:bg-secondary transition">Find Jobs</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {jobs.map((j)=>(
            <div key={j.id} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 hover:border-teal-300 transition-all group shadow-sm hover:shadow-xl hover:shadow-teal-100/20">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-teal-500 text-xl sm:text-2xl font-bold group-hover:bg-primary group-hover:text-white transition-all">{j.title[0]}</div>
                <span className="px-4 py-1.5 bg-teal-50 text-teal-600 rounded-full text-[10px] font-bold uppercase tracking-widest">{j.min_ats_score}% ATS Match</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 group-hover:text-teal-600 transition font-['Plus_Jakarta_Sans']">{j.title}</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">Posted by Recruiter</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-slate-500 text-sm font-medium"><FaBriefcase className="text-teal-400"/> Full-Time</div>
                <div className="flex items-center gap-3 text-slate-500 text-sm font-medium"><FaMoneyBillWave className="text-teal-400"/> ${j.salary} / year</div>
                <div className="flex items-center gap-3 text-slate-500 text-sm font-medium"><FaClock className="text-teal-400"/> Expires: {j.deadline?j.deadline.split('T')[0]:'N/A'}</div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {j.skills?j.skills.split(',').slice(0,3).map((s,idx)=>(
                  <span key={idx} className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">{s.trim()}</span>
                )):null}
              </div>

              <Link to="/login" className="block w-full py-3 sm:py-4 bg-primary text-white rounded-2xl text-center font-bold text-xs uppercase tracking-widest hover:bg-secondary transition-all shadow-lg shadow-slate-100">Log in to Apply</Link>
            </div>
          ))}
        </div>
        {jobs.length===0&&<p className="text-center text-slate-400 font-medium py-20">No jobs found matching your criteria.</p>}
      </div>
      <Footer/>
    </div>
  );
}
