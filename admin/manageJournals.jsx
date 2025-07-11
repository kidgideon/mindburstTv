// File: src/admin/ManageUsers.jsx
import { useState, useEffect } from "react";
import { auth, db } from "../config/config";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import Navbar from "../components/navbar";
import styles from "../styles/manage.module.css";
import LazyLoad from "react-lazyload";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Footer from "../components/footer";


const defaultDp =
  "https://firebasestorage.googleapis.com/v0/b/mindbursttvofficial.firebasestorage.app/o/default.jpg?alt=media&token=c89f4d53-3041-4a5a-923d-5fb0ed419cd5";



const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [currentUid] = useState(auth.currentUser?.uid);
  const [modal, setModal] = useState({ open: false, user: null });
  const nav = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      const good = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => u.uid !== currentUid);
      setUsers(good);
    };
    fetchUsers();
  }, [currentUid]);

  const handleManage = user => setModal({ open: true, user });
  const applyChange = async (act, role) => {
    const u = modal.user;
    const ref = doc(db, "users", u.uid);
    const updates = {
      active: act,
      ...(role && { role })
    };
    const id = toast.loading("Updating user...");
    try {
      await updateDoc(ref, updates);
      setUsers(users.map(x => x.uid === u.uid ? { ...x, ...updates } : x));
      toast.success("Updated!", { id });
    } catch {
      toast.error("Failed to update", { id });
    } finally {
      setModal({ open: false, user: null });
    }
  };

  return (
    <div className="container">
      <Navbar/>
      <div className="area">

        <h1 className={styles.title}>Manage your journalist</h1>
        <div className={styles.inviteBox}>
  <p>Invite new journalist:</p>
  <div className={styles.inviteAction}>
    <input
      type="text"
      value={`${window.location.origin}/admin-signup`}
      readOnly
    />
    <button
      onClick={() => {
        navigator.clipboard.writeText(`${window.location.origin}/admin-signup`);
        toast.success("Invite link copied. Share it with your journalist.");
      }}
    >
      Copy Link
    </button>
  </div>
 
</div>

        <div className={styles.grid}>
          {users.map(u => (
            <LazyLoad key={u.uid} height={200} offset={100} once placeholder={<div className={styles.placeholder} />}>
              <div className={styles.card}>
                <img src={u.profileImage || defaultDp} alt={u.username}/>
                <h4>{u.firstName} {u.lastName}</h4>
                <p>Articles: {Array.isArray(u.articles) ? u.articles.length : 0}</p>
                <button onClick={e => { e.stopPropagation(); handleManage(u); }}>Manage</button>
              </div>
            </LazyLoad>
          ))}
         
        </div>
      </div>

      <AnimatePresence>
        {modal.open && (
          <motion.div className={styles.backdrop} initial={{ opacity:0 }} animate={{ opacity:1 }}>
            <motion.div className={styles.modal} initial={{ scale:0.8 }} animate={{ scale:1 }}>
              <h3>Manage {modal.user.username}</h3>
              <button onClick={() => applyChange(!(modal.user.active), null)}>
                {modal.user.active ? "Deactivate" : "Activate"}
              </button>
              {!modal.user.admin && (
                <button onClick={() => applyChange(true, "admin")}>Promote to Admin</button>
              )}
              <button onClick={() => setModal({ open:false, user:null })}>Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageUsers;
