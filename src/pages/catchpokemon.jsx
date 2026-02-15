import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function CatchGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { player } = location.state || {};
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [position, setPosition] = useState({ top: 200, left: 200 });
  const [speed, setSpeed] = useState(1000);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (time > 0 && !gameOver) {
      const timer = setTimeout(() => setTime(time - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setGameOver(true);
      saveScore();
    }
  }, [time, gameOver]);

  useEffect(() => {
    if (!gameOver) {
      const move = setInterval(() => {
        const top = Math.random() * (window.innerHeight - 150);
        const left = Math.random() * (window.innerWidth - 150);
        setPosition({ top, left });
      }, speed);
      return () => clearInterval(move);
    }
  }, [speed, gameOver]);

  const catchPikachu = () => {
    if (gameOver) return;
    setScore(score + 1);
    if (speed > 300) setSpeed(speed - 50);
  };

  const saveScore = () => {
    const allScores = JSON.parse(localStorage.getItem("pokemonScores")) || {};
    const user = JSON.parse(localStorage.getItem("pokemonCurrentUser"));
    if (user) {
      if (!allScores[user.email]) allScores[user.email] = { username: user.username };
      allScores[user.email].catch = Math.max(allScores[user.email].catch || 0, score);
      localStorage.setItem("pokemonScores", JSON.stringify(allScores));
    }
  };

  const restart = () => {
    setScore(0);
    setTime(30);
    setSpeed(1000);
    setGameOver(false);
  };

  return (
    <div style={styles.container}>
      <h1>🎯 Catch Pikachu</h1>
      <h2>Score: {score}</h2>
      <h3>Time: {time}s</h3>

      {!gameOver && (
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
          alt="pikachu"
          onClick={catchPikachu}
          style={{ ...styles.pikachu, top: position.top, left: position.left }}
        />
      )}

      {gameOver && (
        <div>
          <h2>Game Over 😭</h2>
          <button style={styles.button} onClick={restart}>
            Play Again
          </button>
          <button style={styles.button} onClick={() => navigate("/")}>
            🏠 Back Home
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    margin: 0,
    padding: "20px",
    minHeight: "100vh",
    background: "radial-gradient(circle, #ffea00 20%, #ffcb05 100%)",
    textAlign: "center",
    fontFamily: "Arial",
    color: "#222",
    position: "relative",
    overflow: "hidden",
  },
  pikachu: {
    position: "absolute",
    width: "100px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  button: {
    padding: "12px 25px",
    margin: "10px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#fff",
    background: "linear-gradient(90deg,#ff4b2b,#ff416c)",
    boxShadow: "0 0 10px #ff416c",
  },
};

export default CatchGame;
