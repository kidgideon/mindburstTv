import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../config/config";
import style from "../styles/feed.module.css";

const Feed = () => {
  const [articles, setArticles] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
  const fetchArticles = async () => {
    const snap = await getDocs(collection(db, "articles"));
    const filtered = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((a) => a.published === true)
      .sort((a, b) => b.createdAt - a.createdAt); // manual sort
    setArticles(filtered);
  };

  fetchArticles();
}, []);


  return (
    <div className={style.feedInterface}>
      <div className={style.feedTop}>
        <h1>Top Stories</h1>
        <div className={style.topStories}>
          {articles.map((a) => (
            <div
              key={a.id}
              className={style.feedCard}
              onClick={() => nav(`/feed/${a.id}`)}
            >
              <div className={style.feedImage}>
                <img src={a.coverImage} alt={a.title} />
              </div>
              <div className={style.feedContent}>
                <span className={style.category}>{a.category}</span>
                <h3>{a.title}</h3>
                <p>{a.summary}</p>
                <span className={style.time}>
                  {new Date(a.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  • {new Date(a.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Feed;
