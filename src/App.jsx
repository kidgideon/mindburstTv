import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import AdminHome from "../admin/adminHome";
import Login from "../admin/adminLogin";
import Signup from "../admin/adminSignup";
import Dashboard from "../admin/adminDashboard";
import CreateArticle from "../admin/adminCreateArticle";
import Home from "../pages/home";

function App() {
  return (
    <>
      <Routes>
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/" element={<Home />} />
        <Route path="/admin-signup" element={<Signup />} />
        <Route path="/admin-login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-article" element={<CreateArticle />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
