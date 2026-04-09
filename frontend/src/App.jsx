import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./components/Signup";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";

function App() {
  return (
    <Routes>
      <Route path="/user/register" element={<Signup />} />
      <Route path="/" element={<Home />} />
      <Route path="/user/dashboard"  element={<Dashboard />}  ></Route>
      <Route path="/user/login"  element={<Login />}  ></Route>
    </Routes>
  );
}

export default App;
