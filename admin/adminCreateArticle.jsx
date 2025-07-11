import { useEffect, useState } from "react";
import Footer from "../components/footer";
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { auth, db, storage } from "../config/config";
import { toast } from "sonner";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "../components/navbar";
import styles from "../styles/createArticle.module.css";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_VIDEO_SIZE = 30 * 1024 * 1024; // 30MB

const CreateArticle = () => {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [sections, setSections] = useState([]);
  const [uploading, setUploading] = useState(false);

  const allowedImages = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  const allowedVideos = ["video/mp4", "video/webm", "video/quicktime"];

  // Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else setUser(null);
    });
    return () => unsub();
  }, []);

  // Unload protection
  useEffect(() => {
    const warn = (e) => {
      if (uploading) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [uploading]);

  // Load categories from site settings
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const docSnap = await getDoc(doc(db, "siteInfo", "settings"));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data.categories)) {
            setCategories(data.categories);
          } else {
            toast.error("Invalid categories format in Firestore");
          }
        } else {
          toast.error("Site settings not found");
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        toast.error("Error loading categories");
      }
    };

    loadCategories();
  }, []);

  const handleAddSection = (type) => {
    if (uploading) return;
    setSections((prev) => [
      ...prev,
      { type, file: null, content: "", preview: null },
    ]);
  };

  const handleRemoveSection = (index) => {
    if (uploading) return;
    const updated = [...sections];
    updated.splice(index, 1);
    setSections(updated);
  };

  const handleSectionTextChange = (index, value) => {
    const updated = [...sections];
    updated[index].content = value;
    setSections(updated);
  };

  const handleSectionFile = (file, type, index) => {
    if (!file) return;

    const isImage = allowedImages.includes(file.type);
    const isVideo = allowedVideos.includes(file.type);
    const sizeOK =
      (isImage && file.size <= MAX_IMAGE_SIZE) ||
      (isVideo && file.size <= MAX_VIDEO_SIZE);

    if ((type === "image" && !isImage) || (type === "video" && !isVideo)) {
      return toast.error("Unsupported file type");
    }

    if (!sizeOK) {
      return toast.error(
        type === "image" ? "Image must be ≤ 2MB" : "Video must be ≤ 30MB"
      );
    }

    const updated = [...sections];
    updated[index].file = file;
    updated[index].preview = URL.createObjectURL(file);
    setSections(updated);
  };

  const handleCoverSelect = (file) => {
    if (!file) return;

    if (!allowedImages.includes(file.type)) {
      return toast.error("Invalid cover image format");
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return toast.error("Cover image must be ≤ 2MB");
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const uploadFileWithToast = (fileRef, file, label) => {
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(fileRef, file);
      const toastId = toast.loading(`${label}: Uploading... 0%`);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          toast.loading(`${label}: Uploading... ${progress}%`, {
            id: toastId,
          });
        },
        (error) => {
          toast.error(`${label} upload failed`, { id: toastId });
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          toast.success(`${label} uploaded ✅`, { id: toastId });
          resolve(downloadURL);
        }
      );
    });
  };

  const handleSubmit = async () => {
    if (!title || !summary || !category || !coverFile || sections.length === 0) {
      return toast.error("Fill all required fields");
    }

    if (!user?.uid) {
      return toast.error("You must be logged in");
    }

    setUploading(true);
    const topLevelToast = toast.loading("Publishing article...");

    try {
      const coverRef = ref(storage, `covers/${Date.now()}_${coverFile.name}`);
      const coverURL = await uploadFileWithToast(coverRef, coverFile, "Cover");

      const formattedSections = await Promise.all(
        sections.map(async (s, idx) => {
          if (s.type === "text") {
            if (!s.content.trim()) throw new Error(`Empty text section at ${idx + 1}`);
            return { type: "text", content: s.content.trim() };
          }

          if (!s.file) throw new Error(`Missing file for section ${idx + 1}`);
          const fileRef = ref(storage, `articles/${Date.now()}_${s.file.name}`);
          const fileURL = await uploadFileWithToast(
            fileRef,
            s.file,
            `Section ${idx + 1}`
          );
          return { type: s.type, content: fileURL };
        })
      );

      const articleRef = await addDoc(collection(db, "articles"), {
        title,
        summary,
        category,
        coverImage: coverURL,
        sections: formattedSections,
        createdAt: Date.now(),
        createdBy: user.uid,
        published: true,
      });

      await updateDoc(doc(db, "users", user.uid), {
        articles: arrayUnion(articleRef.id),
      });

      toast.success("Article published 🎉", { id: topLevelToast });

      setTitle("");
      setSummary("");
      setCategory("");
      setCoverFile(null);
      setCoverPreview(null);
      setSections([]);
    } catch (err) {
      console.error("❌ Publish failed:", err);
      toast.error(err?.message || "Failed to publish article", { id: topLevelToast });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container">
      <Navbar />
      <div className="area">
        <div className={styles.formWrap}>
          <h2>Create Article</h2>

          <input
            type="text"
            placeholder="Title / Headline"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
            disabled={uploading}
          />

          <textarea
            placeholder="Summary / Description"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className={styles.textarea}
            disabled={uploading}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={styles.select}
            disabled={uploading}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className={styles.coverUpload}>
            <label htmlFor="coverInput" className={styles.uploadLabel}>
              <i className="fas fa-camera"></i>{" "}
              {coverPreview ? "Change Cover" : "Upload Cover Image"}
            </label>
            <input
              id="coverInput"
              type="file"
              accept="image/*"
              hidden
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCoverSelect(file);
              }}
            />
            {coverPreview && (
              <div className={styles.previewBox}>
                <img src={coverPreview} alt="Cover preview" />
              </div>
            )}
          </div>

          <div className={styles.sectionList}>
            {sections.map((sec, idx) => (
              <div key={idx} className={styles.sectionBox}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTag}>{sec.type.toUpperCase()}</span>
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemoveSection(idx)}
                    disabled={uploading}
                  >
                    ✕
                  </button>
                </div>

                {sec.type === "text" ? (
                  <textarea
                    className={styles.textarea}
                    value={sec.content}
                    onChange={(e) => handleSectionTextChange(idx, e.target.value)}
                    placeholder="Write something..."
                    disabled={uploading}
                  />
                ) : (
                  <>
                    <div className={styles.mediaUpload}>
                      <i
                        className={`fas ${
                          sec.type === "image" ? "fa-image" : "fa-video"
                        } ${styles.uploadIcon}`}
                        onClick={() =>
                          !uploading &&
                          document.getElementById(`file-${sec.type}-${idx}`)?.click()
                        }
                      ></i>
                      <input
                        id={`file-${sec.type}-${idx}`}
                        type="file"
                        accept={sec.type === "image" ? "image/*" : "video/*"}
                        hidden
                        disabled={uploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleSectionFile(file, sec.type, idx);
                        }}
                      />
                    </div>
                    {sec.preview && (
                      <div className={styles.previewBox}>
                        {sec.type === "image" ? (
                          <img src={sec.preview} alt={`preview-${idx}`} />
                        ) : (
                          <video src={sec.preview} controls />
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          <div className={styles.addSectionBtns}>
            <button onClick={() => handleAddSection("text")} disabled={uploading}>
              + Text
            </button>
            <button onClick={() => handleAddSection("image")} disabled={uploading}>
              + Image
            </button>
            <button onClick={() => handleAddSection("video")} disabled={uploading}>
              + Video
            </button>
          </div>

          <div className={styles.actionBtns}>
            <button onClick={handleSubmit} disabled={uploading}>
              {uploading ? "Publishing..." : "Publish Article"}
            </button>
          </div>
        </div>
      
      </div>
    </div>
  );
};

export default CreateArticle;
