import {Link} from "react-router-dom";
import logo from "../assets/logo.png";
import {FaLinkedin, FaWhatsapp} from "react-icons/fa";

export default function Footer(){
  return(
    <footer className="bg-[#f0fdfa] border-t border-teal-100 pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-14 lg:gap-20 mb-16 sm:mb-20 lg:mb-24">
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Shnoor" className="h-10 w-auto"/>
              <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tighter">Shnoor</span>
            </div>
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed font-medium">Empowering the next generation of global talent through high-performance AI recruitment and career intelligence.</p>
            <div className="flex gap-6">
              <a href="https://api.whatsapp.com/send?phone=919041914601&text=HI%21" target="_blank" className="w-12 h-12 bg-white text-slate-400 rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-md"><FaWhatsapp size={20}/></a>
              <a href="https://www.linkedin.com/company/shnoor-international/" target="_blank" className="w-12 h-12 bg-white text-slate-400 rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-md"><FaLinkedin size={20}/></a>
            </div>
          </div>
          <div>
            <h4 className="text-slate-900 font-black mb-10 uppercase text-xs tracking-[4px]">Platform</h4>
            <ul className="space-y-6 text-slate-500 text-base font-bold">
              <li><Link to="/jobs" className="hover:text-teal-600 transition">Browse Roles</Link></li>
              <li><Link to="/register" className="hover:text-teal-600 transition">For Employers</Link></li>
              <li><Link to="/register" className="hover:text-teal-600 transition">For Candidates</Link></li>
              <li><a href="/#features" className="hover:text-teal-600 transition">Features</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-900 font-black mb-10 uppercase text-xs tracking-[4px]">Corporate</h4>
            <ul className="space-y-6 text-slate-500 text-base font-bold">
              <li><a href="https://www.shnoor.com/about-us-business-expansion" target="_blank" className="hover:text-teal-600 transition">Our Mission</a></li>
              <li><a href="#" className="hover:text-teal-600 transition">Careers</a></li>
              <li><a href="#contact" className="hover:text-teal-600 transition">Contact Inquiry</a></li>
              <li><a href="https://www.shnoor.com/privacy-policy" target="_blank" className="hover:text-teal-600 transition">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-[40px] shadow-2xl shadow-teal-500/5 border border-teal-50">
            <h4 className="text-slate-900 font-black mb-6 uppercase text-xs tracking-[4px]">Newsletter</h4>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">Get the latest recruitment intelligence delivered weekly.</p>
            <div className="space-y-4">
              <input type="email" placeholder="work@company.com" className="w-full bg-[#f8fafc] border border-slate-100 p-4 sm:p-5 rounded-2xl text-sm outline-none focus:border-teal-500 transition-all font-medium"/>
              <button className="w-full bg-primary text-white py-4 sm:py-5 rounded-2xl text-xs font-bold uppercase tracking-[3px] hover:bg-secondary transition-all shadow-lg active:scale-95">Subscribe</button>
            </div>
          </div>
        </div>
        <div className="pt-12 border-t border-teal-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[2px]">© 2026 Shnoor Job Portal. Engineering the future.</p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-12 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <a href="https://www.shnoor.com/terms-and-conditions" target="_blank" className="hover:text-teal-600 transition">Terms of Service</a>
            <a href="../../public/Shnoor International Company Profile.pdf" download  className="hover:text-teal-600 transition">About the Company</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
