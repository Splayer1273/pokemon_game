import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [difficulty, setDifficulty] = useState("Easy");
  const [allScores, setAllScores] = useState({});

  // Load user and all scores
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("pokemonCurrentUser"));
    const scores = JSON.parse(localStorage.getItem("pokemonScores")) || {};
    if (!currentUser) {
      navigate("/auth");
    } else {
      setUser(currentUser);
      setAllScores(scores);
    }
  }, [navigate]);

  // Start selected game
  const startGame = (game) => {
    navigate(`/${game}`, {
      state: { player: user.username, difficulty },
    });
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("pokemonCurrentUser");
    navigate("/auth");
  };

  if (!user) return null;

  // Prepare leaderboard
  const leaderboard = Object.entries(allScores)
    .map(([email, scoreObj]) => ({
      email,
      username: scoreObj.username || email.split("@")[0],
      catch: scoreObj.catch || 0,
      zombie: scoreObj.zombie || 0,
      dodge: scoreObj.dodge || 0,
      total: (scoreObj.catch || 0) + (scoreObj.zombie || 0) + (scoreObj.dodge || 0),
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={styles.container}
    >
      <h1 style={styles.title}>⚡ Pokémon Game Hub ⚡</h1>

      <div style={styles.userCard}>
        <h2>👋 {user.username}</h2>
        <p>📧 {user.email}</p>
        <div style={styles.scores}>
          <p>🎯 Catch Highscore: {allScores[user.email]?.catch || 0}</p>
          <p>🧟 Zombie Highscore: {allScores[user.email]?.zombie || 0}</p>
          <p>🏃‍♂️ Dodge Highscore: {allScores[user.email]?.dodge || 0}</p>
        </div>
        <button style={styles.logoutBtn} onClick={logout}>
          🚪 Logout
        </button>
      </div>

      <select
        style={styles.select}
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
      >
        <option>Easy</option>
        <option>Medium</option>
        <option>Hard</option>
      </select>

      <div style={styles.cardContainer}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={styles.cardBlue}
          onClick={() => startGame("catch")}
        >
          🎯 Catch Pokémon
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={styles.cardRed}
          onClick={() => startGame("zombie")}
        >
          🧟 Zombie Mode
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={styles.cardGreen}
          onClick={() => startGame("dodge")}
        >
          🏃‍♂️ Dodge Arena
        </motion.div>
      </div>

      <div style={styles.leaderboard}>
        <h2>🏆 Leaderboard 🏆</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>No.</th>
              <th>Player</th>
              <th>Catch</th>
              <th>Zombie</th>
              <th>Dodge</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((player, i) => (
              <tr key={i} style={player.email === user.email ? styles.highlight : {}}>
                 <td style={styles.td}>{i + 1}</td>
                <td>{player.username}</td>
                <td>{player.catch}</td>
                <td>{player.zombie}</td>
                <td>{player.dodge}</td>
                <td>{player.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "25px",
    fontFamily: "Arial, sans-serif",
    color: "#fff",
    background: "linear-gradient(135deg,#141e30,#243b55)",
    padding: "20px",
  },
  title: { fontSize: "3rem", textShadow: "0 0 15px #ffea00", textAlign: "center" },
  userCard: {
    width: "90%",
    maxWidth: "300px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "20px",
    textAlign: "center",
    boxShadow: "0 0 20px rgba(0,255,255,0.3)",
  },
  scores: { margin: "10px 0", fontWeight: "bold" },
  logoutBtn: {
    padding: "10px 15px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    background: "linear-gradient(90deg,#ff4b2b,#ff416c)",
    color: "#fff",
    marginTop: "10px",
    boxShadow: "0 0 10px #ff416c",
  },
  select: {
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    width: "90%",
    maxWidth: "220px",
    fontWeight: "bold",
    cursor: "pointer",
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
  },
  cardContainer: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: "20px",
  },
  cardBlue: {
    flex: 1,
    minWidth: "140px",
    maxWidth: "200px",
    background: "rgba(0,114,255,0.2)",
    padding: "20px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1.2rem",
    backdropFilter: "blur(5px)",
    textAlign: "center",
    color: "#00f0ff",
    boxShadow: "0 0 15px #00f0ff",
  },
  cardRed: {
    flex: 1,
    minWidth: "140px",
    maxWidth: "200px",
    background: "rgba(255,75,43,0.2)",
    padding: "20px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1.2rem",
    backdropFilter: "blur(5px)",
    textAlign: "center",
    color: "#ff416c",
    boxShadow: "0 0 15px #ff416c",
  },
  cardGreen: {
    flex: 1,
    minWidth: "140px",
    maxWidth: "200px",
    background: "rgba(0,255,0,0.2)",
    padding: "20px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1.2rem",
    backdropFilter: "blur(5px)",
    textAlign: "center",
    color: "#00ff00",
    boxShadow: "0 0 15px #00ff00",
  },
  leaderboard: {
    marginTop: "30px",
    width: "95%",
    maxWidth: "700px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 0 15px rgba(255,255,255,0.2)",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "center",
    fontSize: "0.9rem",
  },
  highlight: { background: "rgba(255,255,0,0.2)" },
};

export default Home;
























