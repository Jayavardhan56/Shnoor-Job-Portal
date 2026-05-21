export default function Features(){
  const features=[
    {title:"AI Resume Analysis",desc:"Real-time candidate evaluation powered by high-performance Llama-3 models."},
    {title:"Pipeline Management",desc:"Organized recruitment workflows to track candidates from application to hire."},
    {title:"Automated Shortlisting",desc:"Configurable ATS thresholds to instantly filter for qualified talent."},
    {title:"Manager Analytics",desc:"Detailed recruitment performance metrics and candidate suitability insights."},
    {title:"Direct Assessments",desc:"Trigger technical round links directly from your dashboard to shortlisted candidates."},
    {title:"Public Job Directory",desc:"Maximize reach with a public-facing job portal optimized for conversion."}
  ];
  return(
    <section id="features" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-white">
  <div className="max-w-7xl mx-auto">

    <div className="flex flex-col md:flex-row justify-between md:items-end mb-16 sm:mb-24 gap-8">

      <div className="md:w-2/3">
        <p className="text-teal-600 font-bold text-[10px] sm:text-xs uppercase tracking-[3px] sm:tracking-[4px] mb-4">
          Core Competencies
        </p>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none">
          Recruitment <br className="hidden sm:block"/> Infrastructure
        </h2>
      </div>

      <div className="md:w-1/3">
        <p className="text-slate-500 text-base sm:text-lg font-medium leading-relaxed">
          A specialized ecosystem designed to eliminate friction in the hiring cycle using structured career intelligence.
        </p>
      </div>

    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-slate-100">

      {features.map((item,idx)=>(

        <div key={idx} className="p-6 sm:p-8 lg:p-12 border-r border-b border-slate-100 hover:bg-slate-50 transition-colors group">

          <span className="text-[10px] font-bold text-teal-500 uppercase tracking-[3px] sm:tracking-[4px] mb-6 sm:mb-8 block">
            Feature 0{idx+1}
          </span>

          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 tracking-tight group-hover:text-teal-600 transition-colors">
            {item.title}
          </h3>

          <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
            {item.desc}
          </p>

        </div>

      ))}

    </div>

  </div>
</section>
  );
}
