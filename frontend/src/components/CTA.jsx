import {Link} from "react-router-dom";

export default function CTA(){
  return(
    <section className="px-8 py-32 bg-white">
      <div className="bg-teal-50 rounded-[48px] p-20 md:p-32 text-center border border-teal-100 max-w-7xl mx-auto relative overflow-hidden">
        <h2 className="text-5xl md:text-7xl font-bold text-slate-800 mb-10 tracking-tight leading-none">Connect with <br/>the Future of Work</h2>
        <p className="text-slate-600 text-xl mb-16 max-w-3xl mx-auto font-medium leading-relaxed">Join thousands of high-performance teams. Deploy your recruitment strategy with real-time AI intelligence today.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link to="/register" className="bg-primary text-white px-12 py-6 rounded-2xl hover:bg-secondary transition-all font-bold text-sm tracking-[3px] uppercase shadow-xl shadow-teal-100 active:scale-95">Launch Your Profile</Link>
          <Link to="/contact" className="bg-white border border-teal-100 text-teal-600 px-12 py-6 rounded-2xl hover:bg-teal-50 transition-all font-bold text-sm tracking-[3px] uppercase active:scale-95">Support Inquiry</Link>
        </div>
      </div>
    </section>
  );
}
