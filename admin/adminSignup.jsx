import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where
} from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../config/config";
import { toast } from "sonner";
import logo from "../images/logo.png";
import "../styles/signup.css";


const defaultDp =
  "https://firebasestorage.googleapis.com/v0/b/mindbursttvofficial.firebasestorage.app/o/default.jpg?alt=media&token=c89f4d53-3041-4a5a-923d-5fb0ed419cd5";

const Signup = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    username: ""
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword, firstName, lastName, username } = form;

    if (!email || !password || !firstName || !lastName || !username || !confirmPassword) {
      return toast.error("All fields are required");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    const toastId = toast.loading("Creating admin account...");
    setLoading(true);

    try {
      const usersRef = collection(db, "users");

      const emailQuery = query(usersRef, where("email", "==", email));
      const emailSnap = await getDocs(emailQuery);
      if (!emailSnap.empty) {
        setLoading(false);
        toast.dismiss(toastId);
        return toast.error("Email already exists");
      }

      const usernameQuery = query(usersRef, where("username", "==", username));
      const usernameSnap = await getDocs(usernameQuery);
      if (!usernameSnap.empty) {
        setLoading(false);
        toast.dismiss(toastId);
        return toast.error("Username already taken");
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await updateProfile(userCredential.user, {
        displayName: username,
        photoURL: defaultDp
      });

      await setDoc(doc(db, "users", uid), {
        uid,
        email,
        username,
        firstName,
        lastName,
        dp: defaultDp,
        role: "admin",
        createdAt: Date.now()
      });

      toast.success("Admin account created successfully");
      setForm({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        username: ""
      });

    } catch (err) {
      console.error(err);
      toast.error("Signup failed. Try again.");
    } finally {
      toast.dismiss(toastId);
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    const toastId = toast.loading("Signing up with Google...");
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const usersRef = collection(db, "users");
      const emailQuery = query(usersRef, where("email", "==", user.email));
      const emailSnap = await getDocs(emailQuery);
      if (!emailSnap.empty) {
        setLoading(false);
        toast.dismiss(toastId);
        return toast.error("Email already exists");
      }

      const newUser = {
        uid: user.uid,
        email: user.email,
        username: user.displayName?.replace(/\s/g, "").toLowerCase() || `user${Date.now()}`,
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ")[1] || "",
        dp: user.photoURL || defaultDp,
        role: "admin",
        createdAt: Date.now()
      };

      await setDoc(doc(db, "users", user.uid), newUser);
      toast.success("Signed up with Google");

    } catch (err) {
      console.error(err);
      toast.error("Google signup failed");
    } finally {
      toast.dismiss(toastId);
      setLoading(false);
    }
  };

  return (
    <div className="x-msupWrap">
      <form className="x-msupForm" onSubmit={handleSubmit}>
        <img src={logo} alt="MindburstTV" className="x-msupLogo" />

        <h2 className="x-msupTitle">Create an Account</h2>

        <div className="x-floatingInput">
          <input type="text" name="firstName" value={form.firstName} onChange={handleChange} placeholder="" required />
          <label>First Name</label>
        </div>

        <div className="x-floatingInput">
          <input type="text" name="lastName" value={form.lastName} onChange={handleChange} placeholder="" required />
          <label>Last Name</label>
        </div>

        <div className="x-floatingInput">
          <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="" required />
          <label>Username</label>
        </div>

        <div className="x-floatingInput">
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="" required />
          <label>Email</label>
        </div>

        <div className="x-floatingInput x-password">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder=""
            required
          />
          <label>Password</label>
          <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} onClick={() => setShowPassword(!showPassword)}></i>
        </div>

        <div className="x-floatingInput x-password">
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            placeholder=""
          />
          <label>Confirm Password</label>
          <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} onClick={() => setShowPassword(!showPassword)}></i>
        </div>

        <button type="submit" className="x-msupBtn" disabled={loading}>
          Create Account
        </button>

        <div className="x-msupOr">or</div>

        <button
          type="button"
          className="x-msupGoogle"
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          <i className="fab fa-google"></i> Sign up with Google
        </button>
         <div className="x-mAreadyHave">
                    Already have an account? <Link to={"/admin-login"}>Login</Link>
                </div>
      </form>
    </div>
  );
};

export default Signup;
