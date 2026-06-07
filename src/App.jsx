import { Route, Routes, Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkUser } from "./redux/authSlice";

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

// NEW CONTEST IMPORTS
import ContestHub from "./pages/ContestHub";
import ContestWorkspace from "./pages/ContestWorkspace";
import ContestLeaderboard from "./pages/ContestLeaderboard";

function App() {
  const { isAuthenticated, loading } = useSelector((state) => state.authSlice);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkUser());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-[#C9963A]"></span>
      </div>
    );
  }

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

      {/* THE FIX: Changed from "/contests" to "/contest" */}
      <Route path="/contest" element={!isAuthenticated ? <Navigate to={'/login'} /> : <ContestHub />} />
      <Route path="/contest/:id/arena" element={!isAuthenticated ? <Navigate to={'/login'} /> : <ContestWorkspace />} />
      <Route path="/contest/:id/leaderboard" element={!isAuthenticated ? <Navigate to={'/login'} /> : <ContestLeaderboard />} />
    </Routes>
  );
}

export default App;