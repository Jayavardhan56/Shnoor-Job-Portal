import {useEffect,useState} from "react";
import api from "../../api";
import {useNavigate} from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";

export default function ManageUsers(){
  const navigate=useNavigate();
  const[users,setUsers]=useState([]);
  const[search,setSearch]=useState("");
  const[selected,setSelected]=useState([]);
  const token=sessionStorage.getItem("token");

  const fetchUsers=async()=>{
    try{
      const res=await api.get("/api/admin/users/",{headers:{Authorization:`Bearer ${token}`}});
      setUsers(res.data);
    }catch(err){}
  };

  const deleteUser=async(id)=>{
    if(!window.confirm("Are you sure you want to remove this user?"))return;
    try{
      await api.delete(`/api/admin/users/${id}/`,{headers:{Authorization:`Bearer ${token}`}});
      fetchUsers();
      setSelected(prev=>prev.filter(i=>i!==id));
    }catch(err){}
  };

  const bulkDelete=async()=>{
    if(!window.confirm(`Delete ${selected.length} selected users?`))return;
    try{
      await api.post("/api/admin/users/bulk-delete/",{ids:selected},{headers:{Authorization:`Bearer ${token}`}});
      setSelected([]);
      fetchUsers();
    }catch(err){}
  };

  const approvePassword=async(id)=>{
    try{
      await api.post(`/api/admin/approve-password/${id}/`,{},{headers:{Authorization:`Bearer ${token}`}});
      fetchUsers();
    }catch(err){}
  };

  const toggleSel=(id)=>{
    setSelected(prev=>prev.includes(id)?prev.filter(i=>i!==id):[...prev,id]);
  };

  useEffect(()=>{fetchUsers();},[]);

  const filtered = users.filter(u=>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return(
    <AdminLayout>
      <div className="max-w-7xl mx-auto font-plus bg-white min-h-screen p-4 sm:p-6 lg:p-12">
        <div className="mb-10 lg:mb-14 flex flex-col lg:flex-row lg:items-end justify-between border-b border-slate-100 pb-6 lg:pb-8 gap-6 lg:gap-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
            <p className="text-slate-500 text-sm mt-2 font-bold">Comprehensive monitoring of global platform accounts</p>
          </div>
          <div className="flex flex-col md:items-end gap-6">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search position or skills..." 
                value={search} 
                onChange={(e)=>setSearch(e.target.value)}
                className="bg-white border border-slate-200 px-12 py-3.5 rounded-[20px] text-sm font-bold w-full lg:w-[440px] focus:outline-none focus:border-teal-500 shadow-sm placeholder:text-slate-400 placeholder:font-bold transition-all"
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              {selected.length > 0 && (
                <button onClick={bulkDelete} className="bg-red-50 text-red-600 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-all">
                  Delete Selected ({selected.length})
                </button>
              )}
              <div className="text-teal-600 font-bold text-xs uppercase tracking-[3px] border-l-2 border-teal-500 pl-6">
                {filtered.length} Accounts
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="hidden lg:grid lg:grid-cols-[70px_1fr_1.5fr_1fr] px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-[2px]">
            <div className="flex justify-center">
              <input 
                type="checkbox" 
                onChange={(e)=>{
                  if(e.target.checked) setSelected(filtered.map(u=>u.id));
                  else setSelected([]);
                }}
                checked={selected.length === filtered.length && filtered.length > 0}
                className="w-4 h-4 accent-teal-600"
              />
            </div>
            <div>User Detail</div>
            <div>Email & Reset Status</div>
            <div className="text-right">Management</div>
          </div>
          <div className="lg:hidden space-y-4"> {filtered.length===0 && (
            <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">No users found matching "{search}".</div>)}
            {filtered.map(u=>(
            <div key={u.id} className={`p-5 rounded-2xl border border-slate-100 space-y-4 ${selected.includes(u.id)?'bg-teal-50/30':'bg-white'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <input 
                  type="checkbox"
                  checked={selected.includes(u.id)}
                  onChange={()=>toggleSel(u.id)}
                  className="w-4 h-4 accent-teal-600 mt-1"/>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center font-bold text-base border border-slate-100">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                <div>
                  <p className="font-bold text-slate-900">{u.username}</p>
                  <p className="text-sm text-slate-400 break-all">{u.email}</p>
                </div>
              </div>
            </div>
          </div>
          {u.has_pending_password && (
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Password Reset Requested
          </span> )}
          <div className="flex flex-wrap gap-4 pt-2">
            <button onClick={()=>navigate(`/admin/user-profile/${u.id}`)} className="text-xs font-bold text-teal-600 uppercase tracking-widest">
              View Profile
            </button>

            {u.has_pending_password && (
              <button onClick={()=>approvePassword(u.id)} className="text-xs font-bold text-teal-600 uppercase tracking-widest">
                Approve
              </button>
            )}
            <button onClick={()=>deleteUser(u.id)} className="text-xs font-bold text-red-500 uppercase tracking-widest">
            Delete</button>
          </div>
          </div>))}
          </div>
          <div className="divide-y divide-slate-100">
            {filtered.length===0 && <div className="p-16 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">No users found matching "{search}".</div>}
            {filtered.map(u=>(
              <div key={u.id} className={`hidden lg:grid lg:grid-cols-[70px_1fr_1.5fr_1fr] items-center py-8 px-6 hover:bg-slate-50/50 transition-all group ${selected.includes(u.id) ? 'bg-teal-50/30' : ''}`}>
                <div className="flex justify-center">
                  <input 
                    type="checkbox" 
                    checked={selected.includes(u.id)} 
                    onChange={()=>toggleSel(u.id)}
                    className="w-4 h-4 accent-teal-600 cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center font-bold text-base border border-slate-100 group-hover:bg-white group-hover:text-teal-600 group-hover:border-teal-100 transition-all">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-bold text-base text-slate-900 group-hover:text-teal-600 transition-colors">{u.username}</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-bold text-slate-400">{u.email}</p>
                  {u.has_pending_password && (
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      Password Reset Requested
                    </span>
                  )}
                </div>
                <div className="text-right space-x-8">
                  <button onClick={()=>navigate(`/admin/user-profile/${u.id}`)} className="text-sm font-bold text-teal-600 uppercase tracking-widest hover:underline">View Profile</button>
                  {u.has_pending_password && (
                    <button onClick={()=>approvePassword(u.id)} className="text-sm font-bold text-teal-600 uppercase tracking-widest hover:underline">Approve</button>
                  )}
                  <button onClick={()=>deleteUser(u.id)} className="text-sm font-bold text-red-500 uppercase tracking-widest hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
