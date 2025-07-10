
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/config";
import { toast } from "sonner";
import Navbar from "../components/navbar";
import styles from "../styles/settings.module.css";
import Footer from "../components/footer";

const SiteSettings = () => {
const [settings, setSettings] = useState({
siteName: "",
about: "",
youtube: "",
twitter: "",
instagram: "",
facebook: "",
tiktok: "",
contactEmail: "",
contactPhone: "",
categories: [],
});
const [newCategory, setNewCategory] = useState("");

useEffect(() => {
const fetchSettings = async () => {
try {
const snap = await getDoc(doc(db, "siteInfo", "settings"));
if (snap.exists()) {
setSettings((prev) => ({ ...prev, ...snap.data() }));
}
} catch (err) {
console.error(err);
toast.error("Failed to load settings");
}
};
fetchSettings();
}, []);

const handleChange = (key, value) => {
setSettings((prev) => ({ ...prev, [key]: value }));
};

const handleAddCategory = () => {
const trimmed = newCategory.trim();
if (!trimmed || settings.categories.includes(trimmed)) return;
setSettings((prev) => ({
...prev,
categories: [...prev.categories, trimmed],
}));
setNewCategory("");
};

const handleRemoveCategory = (name) => {
setSettings((prev) => ({
...prev,
categories: prev.categories.filter((c) => c !== name),
}));
};

const handleSave = async () => {
const toastId = toast.loading("Saving...");
try {
await setDoc(doc(db, "siteInfo", "settings"), settings, { merge: true });
toast.success("Settings saved!");
} catch (err) {
console.error(err);
toast.error("Failed to save");
} finally {
toast.dismiss(toastId);
}
};

return (
<div className="container">
<Navbar />
<div className="area">
<div className={styles.settingsWrap}>
<h2><i className="fas fa-gear"></i> Site Settings</h2>

      <div className={styles.inputGroup}>
        <label><i className="fas fa-globe"></i> Site Name</label>
        <input value={settings.siteName} onChange={(e) => handleChange("siteName", e.target.value)} />
      </div>

      <div className={styles.inputGroup}>
        <label><i className="fas fa-info-circle"></i> About the Site</label>
        <textarea value={settings.about} onChange={(e) => handleChange("about", e.target.value)} />
      </div>

      <div className={styles.inputGroup}>
        <label><i className="fas fa-envelope"></i> Contact Email</label>
        <input value={settings.contactEmail} onChange={(e) => handleChange("contactEmail", e.target.value)} />
      </div>

      <div className={styles.inputGroup}>
        <label><i className="fas fa-phone"></i> Contact Phone</label>
        <input value={settings.contactPhone} onChange={(e) => handleChange("contactPhone", e.target.value)} />
      </div>

      <div className={styles.inputGroup}>
        <label><i className="fab fa-youtube"></i> YouTube</label>
        <input value={settings.youtube} onChange={(e) => handleChange("youtube", e.target.value)} />
      </div>

      <div className={styles.inputGroup}>
        <label><i className="fab fa-twitter"></i> Twitter</label>
        <input value={settings.twitter} onChange={(e) => handleChange("twitter", e.target.value)} />
      </div>

      <div className={styles.inputGroup}>
        <label><i className="fab fa-instagram"></i> Instagram</label>
        <input value={settings.instagram} onChange={(e) => handleChange("instagram", e.target.value)} />
      </div>

      <div className={styles.inputGroup}>
        <label><i className="fab fa-facebook"></i> Facebook</label>
        <input value={settings.facebook} onChange={(e) => handleChange("facebook", e.target.value)} />
      </div>

      <div className={styles.inputGroup}>
        <label><i className="fab fa-tiktok"></i> TikTok</label>
        <input value={settings.tiktok} onChange={(e) => handleChange("tiktok", e.target.value)} />
      </div>

      <div className={styles.inputGroup}>
        <label><i className="fas fa-list"></i> Categories</label>
        <div className={styles.categories}>
          {settings.categories.map((cat, i) => (
            <span key={i} className={styles.catTag}>
              {cat}
              <button onClick={() => handleRemoveCategory(cat)}>×</button>
            </span>
          ))}
          <input
            placeholder="Add new category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
          />
          <button className={styles.addBtn} onClick={handleAddCategory}>
            Add
          </button>
        </div>
      </div>

      <div className={styles.saveBtnWrap}>
        <button className={styles.saveBtn} onClick={handleSave}>
          <i className="fas fa-save"></i> Save Settings
        </button>
      </div>
    </div>
    <Footer/>
  </div>
</div>
);
};

export default SiteSettings;