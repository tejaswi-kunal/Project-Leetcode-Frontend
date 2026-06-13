import { Route, Routes, Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkUser } from "./redux/authSlice";

import PremiumLoader from "./components/PremiumLoader";

import Homepage from "./pages/Homepage";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Problem from "./pages/Problem"; 
import ProblemSubmit from "./pages/ProblemSubmit";

import Profile from "./pages/Profile";
import EditProfile from "./pages/Settings/EditProfile";
import ChangePassword from "./pages/Settings/ChangePassword";

import Leaderboard from "./pages/Leaderboard";
import PublicProfile from "./pages/PublicProfile";

// CONTEST IMPORTS
import ContestHub from "./pages/ContestHub";
import ContestWorkspace from "./pages/ContestWorkspace";
import ContestLeaderboard from "./pages/ContestLeaderboard";

// ADMIN IMPORTS
import AdminLayout from "./pages/AdminLayout";
import AdminDashboardOverview from "./pages/AdminDashboardOverview";
import AdminSubmissions from "./pages/AdminSubmissions";
import CreateProblem from "./pages/CreateProblem";
import ManageProblem from "./pages/ManageProblem";
import UpdateProblemList from "./pages/UpdateProblemList";
import DeleteProblemList from "./pages/DeleteProblemList";
import EditProblem from "./pages/EditProblem";
import ManageContest from "./pages/ManageContest";
import CreateContest from "./pages/CreateContest";
import DeleteContestList from "./pages/DeleteContestList"
import UpdateContestList from "./pages/UpdateContestList"
import EditContest from "./pages/EditContest"
import AdminVideo from "./pages/AdminVideo"
import AdminUpload from "./pages/AdminUpload"

function App() {
  const { isAuthenticated, loading, user } = useSelector((state) => state.authSlice);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkUser());
  }, [dispatch]);

  if (loading) 
  {
    return <PremiumLoader />
  }

  // Strict Admin Check
  const isAdmin = isAuthenticated && user?.role === 'admin';

  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to={'/'} /> : <SignUp />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to={'/'} /> : <Login />} />
      
      <Route path="/problems" element={!isAuthenticated ? <Navigate to={'/login'} /> : <Problem />} />
      <Route path="/problem/:id" element={!isAuthenticated ? <Navigate to={'/login'} /> : <ProblemSubmit />} />

      <Route path="/profile" element={!isAuthenticated ? <Navigate to={'/login'} /> : <Profile />} />
      <Route path="/settings/edit-profile" element={!isAuthenticated ? <Navigate to={'/login'} /> : <EditProfile />} />
      <Route path="/settings/change-password" element={!isAuthenticated ? <Navigate to={'/login'} /> : <ChangePassword />} />

      <Route path="/leaderboard" element={!isAuthenticated ? <Navigate to={'/login'} /> : <Leaderboard />} />
      <Route path="/profile/:id" element={!isAuthenticated ? <Navigate to={'/login'} /> : <PublicProfile />} />

      <Route path="/contest" element={!isAuthenticated ? <Navigate to={'/login'} /> : <ContestHub />} />
      <Route path="/contest/:id/arena" element={!isAuthenticated ? <Navigate to={'/login'} /> : <ContestWorkspace />} />
      <Route path="/contest/:id/leaderboard" element={!isAuthenticated ? <Navigate to={'/login'} /> : <ContestLeaderboard />} />

      {/* ── ADMIN PROTECTED ROUTES ── */}
      <Route path="/admin" element={isAdmin ? <AdminLayout /> : <Navigate to={'/'} />}>
        {/* The Dashboard Overview is now the default view for /admin */}
        <Route index element={<AdminDashboardOverview />} />
        
        {/* Placeholder components for the rest of the admin suite */}
        <Route path="submissions" element={<AdminSubmissions></AdminSubmissions>} />
        <Route path="problems" element={<ManageProblem />} />
        <Route path="problems/create" element={<CreateProblem />} />
        <Route path="problems/update" element={<UpdateProblemList></UpdateProblemList>} />
        <Route path="problems/delete" element={<DeleteProblemList></DeleteProblemList>} />
        <Route path="problems/update/:id" element={<EditProblem></EditProblem>} />
        <Route path="users" element={<div className="text-white">Manage Users (Coming Soon)</div>} />
        {/* Contest Management Routes */}
        <Route path="contests" element={<ManageContest />} />
        <Route path="contests/create" element={<CreateContest></CreateContest>} />
        <Route path="contests/update" element={<UpdateContestList></UpdateContestList>} />
        <Route path="contests/update/:id" element={<EditContest></EditContest>} />
        <Route path="contests/delete" element={<DeleteContestList></DeleteContestList>} />
        <Route path="videos" element={<AdminVideo></AdminVideo>} />
        <Route path="videos/upload/:id" element={<AdminUpload></AdminUpload>} />
      </Route>
      
    </Routes>
  );
}

export default App;