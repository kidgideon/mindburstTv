import { useEffect, useState } from "react";
import { auth, db, storage } from "../config/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/navbar";
import styles from "../styles/profile.module.css";

const defaultDp = "https://firebasestorage.googleapis.com/v0/b/mindbursttvofficial.firebasestorage.app/o/default.jpg?alt=media&token=c89f4d53-3041-4a5a-923d-5fb0ed419cd5";

const steps = ["profileImage", "firstName", "lastName", "bio", "location"];

const Profile = () => {
  const uid = auth.currentUser?.uid;
  const [userData, setUserData] = useState(null);
  const [articles, setArticles] = useState([]);
  const [editing, setEditing] = useState(false);
  const [step, setStep] = useState(0);
  const [dpPreview, setDpPreview] = useState(null);
  const [dpFile, setDpFile] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!uid) return;
      const toastId = toast.loading("Loading profile...");
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          const user = snap.data();
          setUserData(user);
          setForm({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            bio: user.bio || "",
            location: user.location || "",
          });
          setDpPreview(user.profileImage || defaultDp);
          // Load articles
          if (user.articles?.length) {
            const docs = await Promise.all(user.articles.map(id => getDoc(doc(db, "articles", id))));
            setArticles(docs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() })));
          }
        }
      } catch (err) {
        toast.error("Failed to load profile");
        console.error(err);
      } finally {
        toast.dismiss(toastId);
      }
    };
    fetchProfile();
  }, [uid]);

  const handleDpChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type)) return toast.error("Invalid image type");
    setDpFile(file);
    setDpPreview(URL.createObjectURL(file));
  };

  const handleModalSave = async () => {
    const toastId = toast.loading("Saving...");
    try {
      let newDpURL = userData.profileImage;
      if (dpFile) {
        const fileRef = ref(storage, `profile/${uid}_${dpFile.name}`);
        const up = await uploadBytes(fileRef, dpFile);
        newDpURL = await getDownloadURL(up.ref);
      }
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        ...form,
        profileImage: newDpURL,
      });
      toast.success("Profile updated");
      setUserData(prev => ({ ...prev, ...form, profileImage: newDpURL }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update");
    } finally {
      toast.dismiss(toastId);
      setEditing(false);
      setStep(0);
    }
  };

  const nextStep = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else handleModalSave();
  };

  return (
    <div className="container">
      <Navbar />
      <div className="area">
        <div className={styles.profileWrap}>
          <div className={styles.profileTop}>
            <div className={styles.imageArea}>
   <div className={styles.imageBox}>
              <img src={dpPreview} alt="Profile" />
            </div>
              <h2>{userData?.firstName} {userData?.lastName}</h2>
            </div>
            <div className={styles.infoSection}>
              <p className={styles.bio}>{userData?.bio || "No bio"}</p>
              <div className={styles.actionBtns}>
                <button onClick={() => setEditing(true)}>Edit Profile</button>
              </div>
            </div>
          </div>

          <div className={styles.articlesWrap}>
            <h3>Your Articles</h3>
            {articles.length === 0 ? (
              <div className={styles.emptyPortfolio}>
                     <i class="fa-solid fa-newspaper"></i>
                <p>No articles published yet.</p></div>
            ) : (
              <div className={styles.grid}>
                {articles.map((a, i) => (
                  <div className={styles.articleCard} key={i}>
                    <img src={a.coverImage} alt="cover" />
                    <div className={styles.articleInfo}>
                      <h4>{a.title}</h4>
                      <p>{a.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Stepper */}
          <AnimatePresence>
            {editing && (
              <motion.div
                className={styles.modalOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div className={styles.modalCard} initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }}>
                    <h1>update profile</h1>
                  {steps[step] === "profileImage" && (
                    <div>
                        <h2>Profile picture</h2>
                      <img src={dpPreview} alt="Preview" className={styles.modalDp} />
                      <input type="file" accept="image/*" onChange={handleDpChange} />
                    </div>
                  )}
                  {steps[step] === "firstName" && (
                    <div>
                         <h2>First name</h2>
                    <input type="text" placeholder="First Name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                    </div>
                  )}
                  {steps[step] === "lastName" && (
                     <div>
                        <h2>Last name</h2>
                      <input type="text" placeholder="Last Name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                  </div>
                  )}
                  {steps[step] === "bio" && (
                     <div>
                        <h2>Bio</h2>
                          <input placeholder="Bio..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
                     </div>
                  )}
                  {steps[step] === "location" && (
                  <div>
                    <h2>state of origin</h2>
                       <input type="text" placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                  </div>
                  )}
                  <div className={styles.modalActions}>
                    <button onClick={nextStep}>{step === steps.length - 1 ? "Finish" : "Next"}</button>
                    <button onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Profile;
