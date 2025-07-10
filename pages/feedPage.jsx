import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/config";
import styles from "../styles/feedPage.module.css";
import UserNavbar from "../components/userNavbar";
import Footer from "../components/footer";

const FeedPage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [author, setAuthor] = useState(null);
  const [related, setRelated] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "articles", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setArticle(data);

          const userRef = doc(db, "users", data.createdBy);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setAuthor(userSnap.data());
          }

          const q = query(
            collection(db, "articles"),
            where("category", "==", data.category)
          );
          const relatedSnap = await getDocs(q);
          const filtered = relatedSnap.docs
            .filter((d) => d.id !== id)
            .map((doc) => ({ id: doc.id, ...doc.data() }));
          setRelated(filtered);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [id]);

  const pulse = {
    animation: "pulse 1.5s infinite ease-in-out",
    backgroundColor: "#2a2a2a",
    borderRadius: "8px",
  };

  const keyframes = `
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 0.3; }
      100% { opacity: 0.6; }
    }
  `;

  if (!article || !author) {
    return (
      <div className="homeInterface">
        <style>{keyframes}</style>
        <UserNavbar />
        <div style={{ padding: "30px 20px", maxWidth: 800, margin: "auto" }}>
          <div style={{ ...pulse, height: 220, width: "100%", marginBottom: 20 }}></div>
          <div style={{ ...pulse, height: 20, width: "60%", marginBottom: 10 }}></div>
          <div style={{ ...pulse, height: 14, width: "30%", marginBottom: 20 }}></div>
          <div style={{ ...pulse, height: 12, width: "100%", marginBottom: 12 }}></div>
          <div style={{ ...pulse, height: 12, width: "95%", marginBottom: 12 }}></div>
          <div style={{ ...pulse, height: 12, width: "80%", marginBottom: 12 }}></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="homeInterface">
      <UserNavbar />
      <div className={styles.articleContainer}>
        <img
          src={article.coverImage}
          alt={article.title}
          className={styles.coverImage}
        />
        <h1>{article.title}</h1>
        <p className={styles.meta}>
          By {author.firstName} {author.lastName} •{" "}
          {new Date(article.createdAt).toLocaleDateString()}
        </p>
        <div style={{ margin: "10px 0 20px" }}>
  <button
    onClick={() => {
      const url = window.location.href;
      const title = article.title;

      if (navigator.share) {
        navigator.share({
          title: `MindBurst | ${title}`,
          text: title,
          url,
        }).catch((err) => console.error("Share error:", err));
      } else {
        navigator.clipboard.writeText(url).then(() => {
          alert("Link copied to clipboard!");
        });
      }
    }}
    style={{
      backgroundColor: "#fcd600",
      color: "#111",
      padding: "10px 16px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    Share this article
  </button>
</div>


        <div className={styles.sections}>
          {article.sections.map((sec, i) => {
            if (sec.type === "text") {
              return (
                <p key={i} className={styles.section}>
                  {sec.content}
                </p>
              );
            }

            if (sec.type === "image") {
              return (
                <div key={i} className={styles.mediaWrapper}>
                  <img
                    src={sec.content}
                    alt={`section-${i}`}
                    className={styles.mediaImage}
                  />
                </div>
              );
            }

            if (sec.type === "video") {
              return (
                <div key={i} className={styles.mediaWrapper}>
                  <video controls className={styles.mediaVideo}>
                    <source src={sec.content} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              );
            }

            return null;
          })}
        </div>

        <div className={styles.relatedSection}>
          <h2>Read This Also</h2>
          <div className={styles.relatedGrid}>
            {related.map((a) => (
              <div
                key={a.id}
                className={styles.relatedCard}
                onClick={() => nav(`/feed/${a.id}`)}
              >
                <img src={a.coverImage} alt={a.title} />
                <div>
                  <span>{a.category}</span>
                  <h4>{a.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FeedPage;
