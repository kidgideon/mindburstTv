// HoldPage.jsx
import { useEffect } from "react";

function HoldPage() {
  // Disable page scroll while this page is shown
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div style={styles.wrap} role="alert" aria-live="assertive">
      <div style={styles.card}>
        <div style={styles.iconRow}>
          <i
            className="fa-solid fa-triangle-exclamation"
            style={styles.icon}
            aria-hidden="true"
          />
          <i
            className="fa-solid fa-wrench"
            style={{ ...styles.icon, ...styles.iconSmall }}
            aria-hidden="true"
          />
        </div>

        <h1 style={styles.title}>Deployment Required</h1>
        <p style={styles.msg}>
          Deployment process needed to continue the use of the website.
        </p>

        <div style={styles.actions}>
          <a href="mailto:support@gmail.com" style={styles.btn}>
            <i className="fa-regular fa-paper-plane" aria-hidden="true" /> Contact Admin
          </a>
        </div>

        <div style={styles.footerNote}>
          <i className="fa-solid fa-circle-info" aria-hidden="true" /> This is a temporary hold page.
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    background: "#000",
    color: "#fff",
    height: "100vh",
    width: "100vw",
    display: "grid",
    placeItems: "center",
    margin: 0,
    padding: 0,
  },
  card: {
    textAlign: "center",
    padding: "32px",
    maxWidth: 640,
    width: "90vw",
    border: "1px solid #222",
    borderRadius: 12,
    background: "#0a0a0a",
    boxShadow: "0 0 0 1px #111, 0 12px 40px rgba(0,0,0,0.6)",
  },
  iconRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  iconSmall: {
    fontSize: 28,
    opacity: 0.9,
  },
  title: {
    fontSize: 28,
    margin: "8px 0 6px",
    letterSpacing: 0.6,
  },
  msg: {
    fontSize: 16,
    opacity: 0.9,
    margin: "0 0 24px",
    lineHeight: 1.6,
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    textDecoration: "none",
    color: "#000",
    background: "#fff",
    padding: "10px 14px",
    borderRadius: 8,
    fontWeight: 600,
  },
  footerNote: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 8,
  },
};

export default HoldPage;
