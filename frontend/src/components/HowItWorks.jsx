export default function HowItWorks(){
  const steps=[
    {
      title:"Profile Onboarding",
      desc:"Set up your professional credentials and upload your resume. Our system prepares your data for real-time AI indexing.",
      detail:"Secure & Encrypted"
    },
    {
      title:"Skill Mapping",
      desc:"Browse the ecosystem of open roles. Our search engine uses semantic analysis to find positions that match your specific expertise.",
      detail:"AI-Driven Search"
    },
    {
      title:"Automated Evaluation",
      desc:"Apply to jobs and let our Groq-powered Llama-3 agent generate a suitability score and executive summary for recruiters instantly.",
      detail:"Zero Bias Analysis"
    },
    {
      title:"Hiring Decisions",
      desc:"Recruiters review AI insights to shortlist talent. Track your progress from 'Applied' to 'Hired' through your personal pipeline.",
      detail:"Live Status Tracking"
    }
  ];
  return(
    <section id="how" className="px-8 py-20 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="md:w-1/2">
            <p className="text-teal-600 font-bold text-[10px] uppercase tracking-[5px] mb-4">Operational Flow</p>
            <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-none">The Recruitment Pipeline</h2>
          </div>
          <div className="md:w-1/3">
            <p className="text-slate-500 text-base font-medium leading-relaxed">A transparent, four-stage lifecycle designed to connect top talent with high-performance teams using real-time intelligence.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step,idx)=>(
            <div key={idx} className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm relative">
              <span className="text-teal-600 text-[10px] font-bold uppercase tracking-widest mb-8 block">{step.detail}</span>
              <h3 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
