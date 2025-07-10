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
import { toast } from "sonner";

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

          // Fetch author info
          const userRef = doc(db, "users", data.createdBy);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setAuthor(userSnap.data());
          }

          // Fetch related articles
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
        
      }
    };

    fetchData();
  }, [id]);

  if (!article || !author) return null;

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
