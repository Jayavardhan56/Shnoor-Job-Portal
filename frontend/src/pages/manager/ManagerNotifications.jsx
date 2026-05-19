import {useEffect,useState} from "react";
import api from "../../api";
import ManagerLayout from "../../layouts/ManagerLayout";
import {FaBell,FaCommentAlt,FaTrash,FaCheck} from "react-icons/fa";
export default function ManagerNotifications(){
  const[notifications,setNotifications]=useState([]);
  const[selected,setSelected]=useState([]);
  const token=sessionStorage.getItem("token");
  const fetchNotifications=async()=>{
    try{
      const res=await api.get("/api/chat/manager-list/",{headers:{Authorization:`Bearer ${token}`}});
      setNotifications(res.data);
    }catch(err){}
  };
  useEffect(()=>{fetchNotifications();},[]);
  const toggleSelect=(id)=>{
    if(selected.includes(id)){setSelected(selected.filter(i=>i!==id));}
    else{setSelected([...selected,id]);}
  };
  const deleteSelected=async()=>{
    try{
      await Promise.all(selected.map(id=>api.post("/api/chat/delete-notification/",{room_id:id},{headers:{Authorization:`Bearer ${token}`}})));
      setSelected([]);
      fetchNotifications();
    }catch(err){}
  };
  const markAsRead=async(roomId)=>{
    try{
      await api.get(`/api/chat/messages/${roomId}/`,{headers:{Authorization:`Bearer ${token}`}});
      fetchNotifications();
    }catch(err){}
  };
  return(
    <ManagerLayout>
      <div className="mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">Notifications</h1>
          <p className="text-slate-500 font-medium text-sm mt-2 uppercase tracking-widest">Manage candidate updates</p>
        </div>
        {selected.length>0&&(
          <button onClick={deleteSelected} className="px-6 py-3 bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-sm flex items-center gap-2"><FaTrash/> Delete ({selected.length})</button>
        )}
      </div>
      <div className="space-y-6">
        {notifications.length===0?(
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300"><FaBell size={24}/></div>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No new notifications</p>
          </div>
        ):(
          notifications.map(n=>(
            <div key={n.room_id} className={`bg-white p-6 rounded-2xl border ${n.has_unread?'border-teal-100':'border-slate-100'} shadow-sm flex justify-between items-center hover:shadow-md transition-all`}>
              <div className="flex items-center gap-6">
                <input type="checkbox" checked={selected.includes(n.room_id)} onChange={()=>toggleSelect(n.room_id)} className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                <div className={`w-12 h-12 ${n.has_unread?'bg-teal-50 text-teal-600':'bg-slate-50 text-slate-400'} rounded-lg flex items-center justify-center border ${n.has_unread?'border-teal-100':'border-slate-100'} relative`}>
                  <FaCommentAlt size={16}/>
                  {n.has_unread&&<span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans']">New Message from {n.username} {n.has_unread&&<span className="text-xs text-teal-600 font-bold ml-2">(New)</span>}</h3>
                  <p className="text-sm text-slate-500 mt-1">Regarding job: {n.job_title}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">{new Date(n.latest_time).toLocaleString([],{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'short'})}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {n.has_unread&&(
                  <button onClick={()=>markAsRead(n.room_id)} className="p-3 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-all border border-teal-100" title="Mark as Read"><FaCheck size={14}/></button>
                )}
                <a href="/manager/jobs" className="px-6 py-3 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all shadow-sm">View Pipeline</a>
              </div>
            </div>
          ))
        )}
      </div>
    </ManagerLayout>
  );
}
