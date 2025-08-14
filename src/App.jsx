// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
// import AdminHome from "../admin/adminHome";
// import Login from "../admin/adminLogin";
// import Signup from "../admin/adminSignup";
// import Dashboard from "../admin/adminDashboard";
// import CreateArticle from "../admin/adminCreateArticle";
// import Home from "../pages/home";
// import Profile from "../admin/adminProfile";
// import SiteSettings from "../admin/adminSiteSettings";
// import ProtectedRoute from "../protectors/protector";
// import ManageJournals from "../admin/manageJournals";
// import FeedPage from "../pages/feedPage";
// import FeedCategory from "../pages/feedCategory";
import HoldPage from "../pages/holdPage";

function App() {
  return (
    <>
      <Routes>
        {/* All existing routes commented out */}
        {/*
        <Route path="/" element={<Home />} />
        <Route path="/feed/:id" element={<FeedPage />} />
        <Route path="/feed/category/:category" element={<FeedCategory />} />
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/admin-login" element={<Login />} />
        <Route path="/admin-signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-article"
          element={
            <ProtectedRoute>
              <CreateArticle />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/site-setting"
          element={
            <ProtectedRoute>
              <SiteSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-journalists"
          element={
            <ProtectedRoute>
              <ManageJournals />
            </ProtectedRoute>
          }
        />
        */}

        {/* Replacement hold page route */}
        <Route path="*" element={<HoldPage />} />
      </Routes>

      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
