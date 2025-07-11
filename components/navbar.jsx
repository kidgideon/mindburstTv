import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "../styles/navbar.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../config/config";
import { doc, getDoc, collection } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { toast } from "sonner";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role);
        }
      }
    };

    fetchRole();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      navigate("/admin-login");
    } catch (err) {
      console.error(err);
      toast.error("Logout failed");
    }
  };

  const baseLinks = [
    { to: "/dashboard", label: "Home", icon: "fas fa-home" },
    { to: "/create-article", label: "create article", icon: "fa-solid fa-pen-to-square" },
    { to: "/profile", label: "profile", icon: "fa-solid fa-user" },
  ];

  const adminOnlyLinks = [
      { to: "/manage-journalists", label: "Journalists", icon: "fas fa-users-cog" },
    { to: "/site-setting", label: "Site Setting", icon: "fas fa-tools" },
  ];

  const navLinks = userRole === "admin" ? [...baseLinks, ...adminOnlyLinks] : baseLinks;
  return (
    <>
      {/* Top horizontal navbar */}
      <div className={styles.topbar}>
        <div className={styles.brand}>
          MINDBURST<span style={{ color: "#fcd600" }}>•TV</span>
        </div>

        <div className={styles.rightSide}>

          <i
            className={`fas fa-bars ${styles.hamburger}`}
            onClick={() => setIsMobileMenuOpen(true)}
          ></i>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={styles.sidebar}>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ""}`
            }
          >
            <i className={link.icon}></i> {link.label}
          </NavLink>
        ))}
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>

      {/* Mobile Slide-In Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 220, damping: 25 }}
          >
            <div className={styles.mobileHeader}>
              <span>Menu</span>
              <i
                className="fas fa-times"
                onClick={() => setIsMobileMenuOpen(false)}
              ></i>
            </div>

            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ""}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className={link.icon}></i> {link.label}
              </NavLink>
            ))}

            <button
              className={styles.logoutBtnMobile}
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
