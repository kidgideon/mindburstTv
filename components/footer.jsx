import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/config";
import styles from "../styles/footer.module.css";

const Footer = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, "siteInfo", "settings"));
        if (snap.exists()) setSettings(snap.data());
      } catch (err) {
        console.error("Failed to load site settings", err);
      }
    };
    fetchSettings();
  }, []);

  if (!settings) return null;

  const {
    siteName,
    about,
    categories,
    contactEmail,
    contactPhone,
    facebook,
    twitter,
    instagram,
    youtube,
    tiktok
  } = settings;

  const socialIcons = [
    { icon: "fa-facebook", url: facebook },
    { icon: "fa-twitter", url: twitter },
    { icon: "fa-instagram", url: instagram },
    { icon: "fa-youtube", url: youtube },
    { icon: "fa-tiktok", url: tiktok }
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.section}>
          <h3>{siteName}</h3>
          <p>{about}</p>
        </div>

        <div className={styles.section}>
          <h4>Categories</h4>
          <ul>
            {categories?.map((cat, i) => (
              <li key={i}>
                <a href={`/feed/${cat.toLowerCase()}`}>{cat}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.section}>
          <h4>Contact</h4>
          <p>Email: {contactEmail}</p>
          <p>Phone: {contactPhone}</p>
        </div>

        <div className={styles.section}>
          <h4>Follow Us</h4>
          <div className={styles.socials}>
            {socialIcons.map((s, i) => (
              <a
                key={i}
                href={s.url.startsWith("http") ? s.url : `https://${s.url}`}
                target="_blank"
                rel="noreferrer"
              >
                <i className={`fab ${s.icon}`}></i>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.bottomBar}>
        <p>&copy; {new Date().getFullYear()} {siteName} — All rights reserved</p>
      </div>
    </footer>
  );
};

export default Footer;
