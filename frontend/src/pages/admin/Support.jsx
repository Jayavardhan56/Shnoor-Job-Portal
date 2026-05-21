import {useEffect,useState} from "react";
import api from "../../api";
import AdminLayout from "../../layouts/AdminLayout";
export default function Support(){
  const[queries,setQueries]=useState([]);
  const[selected,setSelected]=useState([]);
  const[replyBox,setReplyBox]=useState(null);
  const[replyMessage,setReplyMessage]=useState("");
  const[sending,setSending]=useState(false);
  const[resolved,setResolved]=useState([]);
  const[deleting,setDeleting]=useState(false);
  const token=sessionStorage.getItem("token");
  useEffect(()=>{
    const fetchQueries=async()=>{
      try{
        const res=await api.get("/api/support/contact/admin/",{
          headers:{
            Authorization:`Bearer ${token}`,
          },
        });
        setQueries(res.data);
      }catch(err){
        console.log(err);
      }
    };
    fetchQueries();
  },[]);

  const toggleSelect=(id)=>{
    if(selected.includes(id)){
      setSelected(selected.filter((item)=>item!==id));
    }else{
      setSelected([...selected,id]);
    }
  };
  const deleteSelected=async()=>{
    if(selected.length===0)return;
    setDeleting(true);
    try{
      await api.post("/api/support/contact/delete/",{ids:selected},{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });
      const filtered=queries.filter(
        (query)=>!selected.includes(query.id)
      );
      setQueries(filtered);
      setSelected([]);
      alert("Queries Deleted Successfully");
    }catch(err){
      alert("Failed To Delete Queries");
    }finally{
      setDeleting(false);
    }
  };


  const resolveQuery=async(id)=>{
    try{
      await api.post("/api/support/contact/delete/",{ids:[id]},{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });
      setQueries(queries.filter((q)=>q.id!==id));
      alert("Query Resolved Successfully");
    }catch(err){
      alert("Failed to resolve query");
    }
  };

  const sendReply=async(id)=>{
    if(!replyMessage.trim())return;
    try{
      setSending(true);
      await api.post(
        `/api/support/contact/reply/${id}/`,
        {
          message:replyMessage,
        },
        {
          headers:{
            Authorization:`Bearer ${token}`,
          },
        }
      );
      setQueries(queries.filter((q)=>q.id!==id));
      setReplyBox(null);
      setReplyMessage("");
      alert("Reply Sent Successfully");
    }catch(err){
      alert("Failed To Send Reply");
    }
    setSending(false);
  };
  return(
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
            Support Queries
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            User support and communication requests
          </p>
        </div>
        {selected.length>0&&(
          <button onClick={deleteSelected} disabled={deleting}
            className="px-5 py-3 bg-red-500 text-white rounded-xl text-[11px] font-bold uppercase tracking-[2px] hover:bg-red-600 disabled:opacity-50">
            {deleting?"Deleting...":"Delete Selected"}
          </button>
        )}
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-slate-50 border-b border-slate-200">
              <div className="col-span-1">
                <p className="text-[11px] font-bold uppercase tracking-[2px] text-slate-500">
                  Select
                </p>
              </div>
              <div className="col-span-2 text-[11px] font-bold uppercase tracking-[2px] text-slate-500">
                Name
              </div>
              <div className="col-span-3 text-[11px] font-bold uppercase tracking-[2px] text-slate-500">
                Email
              </div>
              <div className="col-span-3 text-[11px] font-bold uppercase tracking-[2px] text-slate-500">
                Message
              </div>
              <div className="col-span-1 text-[11px] font-bold uppercase tracking-[2px] text-slate-500">
                Status
              </div>
              <div className="col-span-2 text-[11px] font-bold uppercase tracking-[2px] text-slate-500 text-center">
                Actions
              </div>
            </div>
            {Array.isArray(queries)&&queries.map((query,i)=>(
              <div
                key={i}
                className="border-b border-slate-100">
                <div className="grid grid-cols-12 gap-4 px-8 py-6 items-center">
                  <div className="col-span-1">
                    <input type="checkbox" checked={selected.includes(query.id)} onChange={()=>toggleSelect(query.id)}
                      className="w-4 h-4 accent-teal-500"/>
                  </div>
                  <div className="col-span-2">
                    <h3 className="text-xl font-bold text-slate-900">
                      {query.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      #{query.id}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm font-medium text-slate-700 break-all">
                      {query.email}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm text-slate-600">
                      {query.message}
                    </p>
                  </div>
                  <div className="col-span-1">
                    {resolved.includes(query.id)?(
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-[2px]">
                        Sent
                      </span>
                    ):(
                      <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-600 text-[10px] font-bold uppercase tracking-[2px]">
                        New
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 flex gap-3 justify-center">
                    <button onClick={()=>setReplyBox(query.id)}
                      disabled={resolved.includes(query.id)}
                      className={`px-5 py-3 rounded-xl text-[11px] font-bold uppercase tracking-[2px] ${
                        resolved.includes(query.id)
                        ?"bg-green-500 text-white cursor-not-allowed"
                        :"bg-primary text-white hover:bg-secondary"
                      }`}>{resolved.includes(query.id)?"Sent":"Reply"}
                    </button>
                    <button onClick={()=>resolveQuery(query.id)} className="px-5 py-3 border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-[2px] text-slate-700 hover:bg-slate-50">
                      Resolve
                    </button>
                  </div>
                </div>
                {replyBox===query.id&&(
                  <div className="px-8 pb-6">
                    <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                      <textarea
                        value={replyMessage}
                        onChange={(e)=>setReplyMessage(e.target.value)}
                        placeholder="Write your reply..."
                        className="w-full h-24 border border-slate-200 rounded-xl p-4 text-sm outline-none resize-none focus:border-teal-500 bg-white"/>
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={()=>sendReply(query.id)}
                          disabled={sending}
                          className="px-6 py-3 bg-teal-500 text-white rounded-xl text-[11px] font-bold uppercase tracking-[2px] hover:bg-teal-600 disabled:opacity-50">
                          {sending?"Sending...":"Send Reply"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {queries.length===0&&(
          <div className="p-16 text-center">
            <p className="text-slate-400 text-sm">
              No support queries available
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}