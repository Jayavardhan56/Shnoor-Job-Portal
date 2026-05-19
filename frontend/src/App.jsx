import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import './App.css'
import Profile from './pages/user/Profile';
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from './pages/admin/ManageUsers';
import ManageManagers from './pages/admin/ManageManagers';
import SkillsInsights from './pages/admin/SkillsInsights';
import ManagerAnalytics from './pages/admin/ManagerAnalytics';
import Conversion from './pages/admin/Conversion';
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import PostJob from "./pages/manager/PostJob";
import ManageJobs from "./pages/manager/ManageJobs";
import Applicants from "./pages/manager/Applicants";
import UserRatings from "./pages/manager/UserRatings";
import UserDashboard from './pages/user/UserDashboard';
import BrowseJobs from './pages/user/BrowseJobs';
import Applications from './pages/user/MyApplications';
import JobDetails from './pages/user/JobDetails';
import PublicJobs from './pages/PublicJobs';
import ScrollToTop from './components/ScrollToTop';
import ResumeAi from './pages/user/ResumeAi';
import StageChat from './pages/manager/StageChat';
import Notifications from './pages/user/Notifications';
import ManagerMessages from './pages/manager/ManagerMessages';
import UserProfileView from './pages/UserProfileView';
import CompanyProfileEditor from "./pages/manager/CompanyProfileEditor";
import CompanyProfileView from "./pages/user/CompanyProfileView";
import Support from './pages/admin/Support';

function App() {

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<PublicJobs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/user/jobs" element={<BrowseJobs />} />
        <Route path="/user/job/:id" element={<JobDetails />} />
        <Route path="/user/profile" element={<Profile />} />
        <Route path="user/resume-ai" element={<ResumeAi />} />
        <Route path="/manager/applicants" element={<Applicants />} />
        <Route path="/manager/post-job" element={<PostJob />} />
        <Route path="/manager/jobs" element={<ManageJobs />} />
        <Route path="/manager/ratings" element={<UserRatings />} />
        <Route path="/manager/stage-chat" element={<StageChat />} />
        <Route path="/manager/messages" element={<ManagerMessages />} />
        <Route path="/manager/company" element={<CompanyProfileEditor />} />
        <Route path="/company/:manager_id" element={<CompanyProfileView />} />

        <Route path="/user/applications" element={<Applications />} />
        <Route path="/user/notifications" element={<Notifications />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/managers" element={<ManageManagers />} />
        <Route path="/admin/skills" element={<SkillsInsights />} />
        <Route path="/admin/analytics" element={<ManagerAnalytics />} />
        <Route path="/admin/conversion" element={<Conversion />} />
        <Route path="/admin/Support" element={<Support/>}/>
        <Route path="/admin/user-profile/:id" element={<UserProfileView />} />
        <Route path="/manager/user-profile/:id" element={<UserProfileView />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
