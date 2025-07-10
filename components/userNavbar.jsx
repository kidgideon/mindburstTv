import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Styles from "../styles/userNavbar.module.css";
import Logo from "../images/logo.png";
import { motion, AnimatePresence } from "framer-motion";
const categories = [
  ["Health", "Tech", "Banking"],
  ["Education", "Kids", "Politics"],
  ["Insurance", "Sports", "World"],
  ["TNT", "Article", "Story"]
];

const UserNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigate();

  const handleToggle = () => setMenuOpen(prev => !prev);

  const goToCategory = (cat) => {
    nav(`/feed/${cat.toLowerCase()}`);
    setMenuOpen(false); // auto-close on mobile
  };

  return (
    <div className={Styles.Navbar}>
      <div className={Styles.topArea}>
        <div className={Styles.imageArea}>
          <img src={Logo} alt="logo" />
          <p>mindburst.<span style={{ color: "#fcd600" }}>TV</span></p>
        </div>

        <div className={Styles.mobileArea}>
          <div className={Styles.youtubeArea}>
            <i className="fa-brands fa-youtube"></i>
          </div>
          <div className={Styles.mobileHarmburger} onClick={handleToggle}>
            <i className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`}></i>
          </div>
        </div>
      </div>

      <div className={Styles.searchArea}>
        <i className="fa-solid fa-magnifying-glass"></i>
        <input type="text" placeholder="find a story" />
      </div>

      {/* Slide down menu */}
     <AnimatePresence>
  {menuOpen && (
    <motion.div
      className={Styles.slideArea}
      initial={{ opacity: 0, maxHeight: 0 }}
      animate={{ opacity: 1, maxHeight: 1000 }}
      exit={{ opacity: 0, maxHeight: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      style={{ overflow: "hidden" }}
    >
      <div className={Styles.categories}>
        {categories.map((group, i) => (
          <div key={i} className={Styles.catogryListing}>
            {group.map((item) => (
              <p key={item} onClick={() => goToCategory(item)}>
                {item}
              </p>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  )}
</AnimatePresence>


      {/* Always visible on desktop */}
      <div className={`${Styles.categories} ${Styles.desktopOnly}`}>
        {categories.map((group, i) => (
          <div key={i} className={Styles.catogryListing}>
            {group.map((item) => (
              <p key={item} onClick={() => goToCategory(item)}>
                {item}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserNavbar;
