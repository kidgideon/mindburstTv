import { useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { auth, db, storage } from "../config/config";
import { toast } from "sonner";
import Navbar from "../components/navbar";
import styles from "../styles/createArticle.module.css";

const categories = [
  "Politics", "Sports", "Entertainment", "Business", "Tech", "World", "Health",
];

const CreateArticle = () => {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [sections, setSections] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleAddSection = (type) => {
    setSections((prev) => [...prev, { type, file: null, content: "", preview: null }]);
  };

  const handleRemoveSection = (index) => {
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
    const allowedImage = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/avif"];
    const allowedVideo = ["video/mp4", "video/webm", "video/quicktime"];

    const isValid =
      (type === "image" && allowedImage.includes(file.type)) ||
      (type === "video" && allowedVideo.includes(file.type));

    if (!isValid) return toast.error("Unsupported file format");

    const updated = [...sections];
    updated[index].file = file;
    updated[index].preview = URL.createObjectURL(file);
    setSections(updated);
  };

  const handleCoverSelect = (file) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/avif"];
    if (!allowed.includes(file.type)) {
      return toast.error("Invalid cover image type");
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };
const handleSubmit = async () => {
  console.log("🔄 Submission started");

  if (!title || !summary || !category || !coverFile || sections.length === 0) {
    toast.error("Please fill all required fields");
    console.warn("🚫 Missing required fields", {
      title,
      summary,
      category,
      coverFile,
      sectionsLength: sections.length,
    });
    return;
  }

  if (!auth.currentUser?.uid) {
    toast.error("User not authenticated");
    console.warn("🚫 No user UID found");
    return;
  }

  const toastId = toast.loading("Publishing article...");
  setUploading(true);

  try {
    console.log("📤 Uploading cover image...");
    const coverRef = ref(storage, `covers/${Date.now()}_${coverFile.name}`);
    const coverSnap = await uploadBytes(coverRef, coverFile);
    const coverURL = await getDownloadURL(coverSnap.ref);
    console.log("✅ Cover uploaded:", coverURL);

    console.log("📤 Processing sections...");
    const formattedSections = await Promise.all(
      sections.map(async (s, i) => {
        console.log(`⏳ Section ${i + 1}`, s);

        if (s.type === "text") {
          if (!s.content || s.content.trim() === "") {
            throw new Error(`Text section ${i + 1} is empty`);
          }
          return { type: "text", content: s.content };
        }

        if (!s.file) {
          throw new Error(`Missing file in section ${i + 1}`);
        }

        const fileRef = ref(storage, `articles/${Date.now()}_${s.file.name}`);
        const snap = await uploadBytes(fileRef, s.file);
        const fileURL = await getDownloadURL(snap.ref);

        console.log(`✅ Section ${i + 1} uploaded`, { url: fileURL });
        return { type: s.type, content: fileURL };
      })
    );

    console.log("📝 Saving article to Firestore...");
    await addDoc(collection(db, "articles"), {
      title,
      summary,
      category,
      coverImage: coverURL,
      sections: formattedSections,
      createdAt: Date.now(),
      createdBy: auth.currentUser.uid,
      published: true,
    });

    toast.success("Article published!");
    console.log("✅ Article published successfully");

    // Reset state
    setTitle("");
    setSummary("");
    setCategory("");
    setCoverFile(null);
    setCoverPreview(null);
    setSections([]);
  } catch (err) {
    console.error("❌ Publish failed:", err);
    toast.error("Failed to publish article");
  } finally {
    toast.dismiss(toastId);
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
              <option key={cat}>{cat}</option>
            ))}
          </select>

          <div className={styles.coverUpload}>
            <label htmlFor="coverInput" className={styles.uploadLabel}>
              <i className="fas fa-camera"></i> {coverPreview ? "Change Cover" : "Upload Cover"}
            </label>
            <input
              id="coverInput"
              type="file"
              accept="image/*"
              hidden
              disabled={uploading}
              onChange={(e) => handleCoverSelect(e.target.files[0])}
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
                    placeholder="Write content..."
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
                          document.getElementById(`file-${sec.type}-${idx}`)?.click()
                        }
                      ></i>
                      <input
                        id={`file-${sec.type}-${idx}`}
                        type="file"
                        hidden
                        accept={sec.type === "image" ? "image/*" : "video/*"}
                        disabled={uploading}
                        onChange={(e) =>
                          handleSectionFile(e.target.files[0], sec.type, idx)
                        }
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
            <button onClick={() => handleAddSection("text")} disabled={uploading}>+ Text</button>
            <button onClick={() => handleAddSection("image")} disabled={uploading}>+ Image</button>
            <button onClick={() => handleAddSection("video")} disabled={uploading}>+ Video</button>
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
