import { useState } from "react";
import api from "../api";
export default function ContactSection(){
  const[formData,setFormData]=useState({
    name:"",
    email:"",
    message:"",
  })
  const[loading,setLoading]=useState(false);
  const[success,setsuccess]=useState("");
  const[error,setError]=useState("");
  const handleChange=(e)=>{
    setFormData({
      ...formData,
      [e.target.name]:e.target.value,
    });
  };
  const handleSubmit=async(e)=>{
    e.preventDefault();
    setLoading(true);
    setsuccess("");
    setError("");
    try{
      await api.post("/api/support/contact/",formData);
      setsuccess("Message Sent Successfully");
      setFormData({
        name:"",
        email:"",
        message:"",
      });
    }catch(err){
      setError("Failed to Send Message"+err);
    }
    setLoading(false);
  }
  return(
    <section id="contact" className="px-8 py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <p className="text-teal-600 font-bold text-xs uppercase tracking-[5px] mb-4">Direct Support</p>
          <h2 className="text-5xl font-black text-slate-800 tracking-tight">How can we help?</h2>
        </div>
        <div className="bg-[#f8fafc] border border-slate-200 rounded-[32px] p-12 md:p-20 max-w-6xl mx-auto shadow-sm">
          <div className="grid lg:grid-cols-2 gap-24">
            <div>
              <h3 className="text-3xl font-bold text-slate-900 mb-10 tracking-tight">Send a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[3px] ml-1">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" className="w-full p-5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50 transition-all font-medium text-slate-700"/>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[3px] ml-1">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@company.com" className="w-full p-5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50 transition-all font-medium text-slate-700"/>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[3px] ml-1">Your Inquiry</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} placeholder="How can we assist you today?" className="w-full p-6 bg-white border border-slate-200 rounded-[28px] outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50 transition-all font-medium text-slate-700 h-44 resize-none"></textarea>
                </div>
                {success&&(<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm font-medium">{success}</div>)}
                {error&&(<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium">{error}</div>)}
                <button type="submit" disabled={loading} className="w-full py-6 bg-primary text-white rounded-[20px] font-bold text-xs uppercase tracking-[4px] hover:bg-secondary transition-all shadow-xl active:scale-95">{loading?"Sending":"Send Communication"}</button>
              </form>
            </div>
            <div className="flex flex-col justify-between py-2">
              <div className="space-y-16">
                <div>
                  <h4 className="text-teal-600 font-bold mb-6 uppercase text-[10px] tracking-[5px]">Channels</h4>
                  <div className="space-y-4">
                    <a href="mailto:info@shnoor.com" className="text-xl font-bold text-slate-800 tracking-tight hover:text-teal-600 transition cursor-pointer">info@shnoor.com</a><br />
                    <a href="mailto:support@shnoor.com" className="text-xl font-bold text-slate-800 tracking-tight hover:text-teal-600 transition cursor-pointer">support@shnoor.com</a>
                  </div>
                </div>
                <div>
                  <h4 className="text-teal-600 font-bold mb-6 uppercase text-[10px] tracking-[5px]">Headquarters</h4>
                  <a href="https://maps.app.goo.gl/NoTwnXDzCzaHrrDo8" target="_blank" className="text-xl font-bold text-slate-800 tracking-tight leading-relaxed">10009 Mount Tabor Road, <br/>Odessa, Missouri, US.</a>
                </div>
                <div>
                  <h4 className="text-teal-600 font-bold mb-6 uppercase text-[10px] tracking-[5px]">Availability</h4>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-slate-800 tracking-tight">Mon — Fri: 10:00 - 19:00</p>
                    <p className="text-slate-500 font-medium">Weekends: Automated Support Only</p>
                  </div>
                </div>
              </div>
              <div className="mt-16 pt-12 border-t border-slate-200">
                <p className="text-slate-400 text-xs font-medium leading-relaxed italic">"Our mission is to bridge the gap between elite talent and high-growth opportunities through technical excellence."</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
