import {Route,Routes,Navigate} from "react-router"
import Homepage from "./pages/Homepage";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import { useDispatch,useSelector } from "react-redux";
import { useEffect } from "react";
import { checkUser } from "./redux/authSlice";
import Problem from "./pages/Problem"; 
import ProblemSubmit from "./pages/ProblemSubmit";


function App()
{
  const {isAuthenticated,error,loading}=useSelector((state)=>state.authSlice);
  const dispatch=useDispatch();

  // check intial authentication ,if user is already logined
  useEffect(()=>{
    dispatch(checkUser());
  },[]);

  // while checking we dont want to immediately see the login page so use loading
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }
  

  return(
    <Routes>
      <Route path="/" element={isAuthenticated?<Homepage></Homepage>:<Navigate to={'/login'}/>}></Route>
      <Route path="/signup" element={isAuthenticated?<Navigate to={'/'}/>:<SignUp></SignUp>}></Route>
      <Route path="/login" element={isAuthenticated?<Navigate to={'/'}/>:<Login></Login>}></Route>
      <Route path="/problems" element={!isAuthenticated?<Navigate to={'/login'}/>:<Problem></Problem>} ></Route>
      <Route path="/problem/:id" element={!isAuthenticated?<Navigate to={'/login'}/>:<ProblemSubmit></ProblemSubmit>} ></Route>
    </Routes>
  )
}

export default App;