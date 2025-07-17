import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../config/config";
import Styles from "../styles/userNavbar.module.css";
import Logo from "../images/logo.png";
import { motion, AnimatePresence } from "framer-motion";

const groupCategories = (list, groupSize = 3) => {
  const groups = [];
  for (let i = 0; i < list.length; i += groupSize) {
    groups.push(list.slice(i, i + groupSize));
  }
  return groups;
};

const UserNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allArticles, setAllArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const nav = useNavigate();
  const inputRef = useRef();

  // Fetch categories from Firestore
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const snap = await getDoc(doc(db, "siteInfo", "settings"));
        const data = snap.exists() ? snap.data() : {};
        if (Array.isArray(data.categories)) {
          setCategories(groupCategories(data.categories));
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    loadCategories();
  }, []);

  // Load all articles for search suggestions
  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "articles"));
      const arr = snap.docs
        .filter((d) => d.data().published)
        .map((d) => ({
          id: d.id,
          title: d.data().title
        }));
      setAllArticles(arr);
    };
    fetch();
  }, []);

  // Fuzzy search filter
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return setSuggestions([]);
    const words = term.split(/\s+/);
    const matches = allArticles.filter((a) =>
      words.every((w) => a.title.toLowerCase().includes(w))
    );
    setSuggestions(matches.length ? matches.slice(0, 7) : [{ id: null, title: "No results found" }]);
  }, [searchTerm, allArticles]);

  // Outside click closes suggestion
  useEffect(() => {
    const onClick = (e) => {
      if (!inputRef.current?.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const handleToggle = () => setMenuOpen((prev) => !prev);

  const goToCategory = (cat) => {
    nav(`/feed/category/${cat.toLowerCase()}`);
    setMenuOpen(false);
  };

  const onSelect = (item) => {
    if (!item.id) return;
    nav(`/feed/${item.id}`);
    setSearchTerm("");
    setSuggestions([]);
  };

  return (
    <div className={Styles.Navbar}>
      <div className={Styles.topArea}>
        <div onClick={() => nav("/")} className={Styles.imageArea}>
          <img src={Logo} alt="logo" />
          <p>
            mindburst.<span style={{ color: "#fcd600" }}>TV</span>
          </p>
        </div>

        <div className={Styles.mobileArea}>
        <div className={Styles.youtubeArea}>
  <a
    href="https://www.youtube.com/@mindburstTV"
    target="_blank"
    rel="noopener noreferrer"
  >
    <i
      className="fa-brands fa-youtube"
      style={{ color: "#FF0000", marginRight: "15px", fontSize: "1.5rem" }}
    ></i>
  </a>

  <a
    href="https://www.facebook.com/share/16q4iz5KBG/"
    target="_blank"
    rel="noopener noreferrer"
  >
    <i
      className="fa-brands fa-facebook"
      style={{ color: "#1877F2", marginRight: "15px", fontSize: "1.5rem" }}
    ></i>
  </a>

  <a
    href="https://www.instagram.com/mindbursttv?igsh=NHI5cGdtdmFtMnpl"
    target="_blank"
    rel="noopener noreferrer"
  >
    <i
      className="fa-brands fa-instagram"
      style={{
        background:
          "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontSize: "1.5rem",
        marginRight: "15px",
      }}
    ></i>
  </a>

  <a
    href="https://x.com/mindburstTV?t=mTMpLb9W-s2QpjmpQl1qCg&s=09"
    target="_blank"
    rel="noopener noreferrer"
  >
    <i
      className="fa-brands fa-x-twitter"
      style={{ color: "#5c5c5cff", marginRight: "15px", fontSize: "1.5rem" }}
    ></i>
  </a>

  <a
    href="https://www.tiktok.com/@mind.bursttv?_t=ZM-8y66wNDc3Rm&_r=1"
    target="_blank"
    rel="noopener noreferrer"
  >
    <i
      className="fa-brands fa-tiktok"
      style={{ color: "#919191ff", fontSize: "1.5rem" }}
    ></i>
  </a>
</div>



          <div className={Styles.mobileHarmburger} onClick={handleToggle}>
            <i className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`}></i>
          </div>
        </div>
      </div>

      {/* Search with dropdown */}
      <div className={Styles.searchArea} ref={inputRef}>
        <i className="fa-solid fa-magnifying-glass"></i>
        <input type="text"
          placeholder="find a story"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} onFocus={() => setSearchTerm((prev) => prev)}
        />

        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.ul
              className={Styles.suggestList}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {suggestions.map((item, i) => (
                <li key={i} onClick={() => onSelect(item)}>
                  {item.title}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Dropdown */}
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

      {/* Desktop Categories */}
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
