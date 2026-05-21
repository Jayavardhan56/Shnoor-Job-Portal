import {Link} from "react-router-dom";

export default function Hero(){
  return(
    <section id="home" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center max-w-7xl mx-auto">
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[84px] font-black text-slate-900 mb-8 leading-[0.9] tracking-tighter">
        Find Your Next <br className="hidden sm:block"/> Opportunity with <span className="text-teal-500">Shnoor</span>
      </h1>
      <p className="text-slate-500 text-base sm:text-lg md:text-2xl max-w-3xl mx-auto mb-10 sm:mb-16 font-medium leading-relaxed">
        Explore the global ecosystem of high-growth roles and take the next step in your professional career with real-time AI intelligence.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 lg:gap-8">
        <Link to="/jobs" className="bg-primary text-white px-8 sm:px-10 lg:px-14 py-4 sm:py-5 lg:py-6 rounded-2xl hover:bg-secondary transition-all shadow-2xl shadow-slate-300 font-bold text-sm uppercase tracking-wide sm:tracking-[2px] lg:tracking-[4px] active:scale-95">
        Explore Jobs</Link>
        <Link to="/register" className="bg-white border-2 border-slate-100 text-slate-700 px-8 sm:px-10 lg:px-14 py-4 sm:py-5 lg:py-6 rounded-2xl hover:bg-slate-50 transition-all font-bold text-sm uppercase tracking-wide sm:tracking-[2px] lg:tracking-[4px] active:scale-95">
        Post a Requirement</Link>
      </div>
    </section>
  );
}
