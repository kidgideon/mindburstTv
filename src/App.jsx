import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import AdminHome from "../admin/adminHome";
import Login from "../admin/adminLogin";
import Signup from "../admin/adminSignup";

function App() {
  return (
    <>
      <Routes>
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/admin-signup" element={<Signup />} />
        <Route path="/admin-login" element={<Login />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
