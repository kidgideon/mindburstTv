import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/config";
import styles from "../styles/category.module.css";
import UserNavbar from "../components/userNavbar";
import Footer from "../components/footer";

const FeedCategory = () => {
  const { category } = useParams();
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    const fetchAllPublishedArticles = async () => {
      try {
        const q = query(
          collection(db, "articles"),
          where("published", "==", true)
        );
        const snap = await getDocs(q);
        const allArticles = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // filter by category on client
        const filtered = allArticles.filter(
          (a) => a.category?.toLowerCase() === category?.toLowerCase()
        );
        setFeeds(filtered);
      } catch (err) {
        console.error("Error fetching category articles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPublishedArticles();
  }, [category]);

  return (
    <div className="homeInterface">
      <UserNavbar />

      <div className={styles.categoryPage}>
        <h1>{category} News</h1>

        <div className={styles.feedGrid}>
          {loading
            ? [...Array(6)].map((_, i) => (
                <div key={i} style={{
                  width: "100%",
                  maxWidth: "300px",
                  height: "300px",
                  backgroundColor: "#1e1e1e",
                  borderRadius: "8px",
                  animation: "pulse 1.2s ease-in-out infinite",
                }} />
              ))
            : feeds.length > 0 ? feeds.map((a) => (
                <div
                  key={a.id}
                  className={styles.feedCard}
                  onClick={() => nav(`/feed/${a.id}`)}
                >
                  <img src={a.coverImage} alt={a.title} />
                  <div className={styles.cardContent}>
                    <span>{a.category}</span>
                    <h4>{a.title}</h4>
                    <p>{a.summary}</p>
                  </div>
                </div>
              )) : (
                <p style={{ color: "#999", textAlign: "center", width: "100%" }}>
                  No articles found in this category.
                </p>
              )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FeedCategory;
