import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../config/config";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../images/logo.png";
import "../styles/login.css";

const defaultDp =
  "https://firebasestorage.googleapis.com/v0/b/mindbursttvofficial.firebasestorage.app/o/default.jpg?alt=media&token=c89f4d53-3041-4a5a-923d-5fb0ed419cd5";


const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);

  const handleGoogleLogin = async () => {
  const provider = new GoogleAuthProvider();
  const toastId = toast.loading("Signing in with Google...");
  setLoading(true);

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user already exists
    const usersRef = collection(db, "users");
    const emailQuery = query(usersRef, where("email", "==", user.email));
    const snap = await getDocs(emailQuery);

    if (snap.empty) {
      const username = user.displayName?.replace(/\s/g, "").toLowerCase() || `user${Date.now()}`;
      const newUser = {
        uid: user.uid,
        email: user.email,
        username,
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ")[1] || "",
        dp: user.photoURL || defaultDp,
        role: "admin",
        createdAt: Date.now()
      };

      await setDoc(doc(db, "users", user.uid), newUser);
      toast.success("Account created & logged in");
    } else {
      toast.success("Login successful");
    }
  } catch (err) {
    console.error(err);
    toast.error("Google login failed");
  } finally {
    toast.dismiss(toastId);
    setLoading(false);
  }
};


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = form;

    if (!email || !password) return toast.error("All fields are required");

    const toastId = toast.loading("Signing in...");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful");
    } catch (err) {
      console.error(err);
      toast.error("Invalid email or password");
    } finally {
      toast.dismiss(toastId);
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) return toast.error("Email required");
    const toastId = toast.loading("Sending reset email...");
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success("Reset link sent to your email");
      setShowResetModal(false);
      setResetEmail("");
    } catch (err) {
      console.error(err);
      toast.error("Error sending reset email");
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <div className="x-mloginWrap">
      <form className="x-mloginForm" onSubmit={handleLogin}>
        <img src={logo} alt="MindburstTV" className="x-mloginLogo" />
        <h2 className="x-mloginTitle">Welcome Back</h2>

        <div className="x-floatingInput">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder=""
          />
          <label>Email</label>
        </div>

        <div className="x-floatingInput x-password">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder=""
          />
          <label>Password</label>
          <i
            className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
            onClick={() => setShowPassword(!showPassword)}
          ></i>
        </div>

        <div className="x-mloginForgot" onClick={() => setShowResetModal(true)}>
          Forgot password?
        </div>

        <button type="submit" className="x-mloginBtn" disabled={loading}>
          {loading ? "Processing..." : "Sign In"}
        </button>
        <div className="x-msupOr">or</div>

<button
  type="button"
  className="x-msupGoogle"
  onClick={handleGoogleLogin}
  disabled={loading}
>
  <i className="fab fa-google"></i> Continue with Google
</button>

 <div className="x-mAreadyHave">
            Dont have an account? <Link to={"/admin-signup"}>Signup</Link>
        </div>

      </form>

      <AnimatePresence>
        {showResetModal && (
          <motion.div
            className="x-resetModalBackdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="x-resetModal"
              initial={{ scale: 0.8, y: "-20%" }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: "-20%" }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <h3>Reset Password</h3>
              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              <div className="x-resetActions">
                <button onClick={handleResetPassword}>Send Link</button>
                <button onClick={() => setShowResetModal(false)}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
