import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function DodgeGame() {
  const navigate = useNavigate();
  const GAME_WIDTH = 600;
  const GAME_HEIGHT = 600;
  const PLAYER_SIZE = 70;
  const PLAYER_MARGIN = 5; // New: margin from left/right edges

  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_SIZE / 2);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(4);
  const [gameOver, setGameOver] = useState(false);
  const [user, setUser] = useState(null);
  const [lastSpeedUpScore, setLastSpeedUpScore] = useState(0);

  // Load user
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("pokemonCurrentUser"));
    if (!currentUser) {
      navigate("/auth");
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  // Player Movement (keyboard)
  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;
      if (e.key === "ArrowLeft")
        setPlayerX((x) => Math.max(PLAYER_MARGIN, x - 20));
      if (e.key === "ArrowRight")
        setPlayerX((x) =>
          Math.min(GAME_WIDTH - PLAYER_SIZE - PLAYER_MARGIN, x + 20)
        );
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameOver]);

  // Game Loop
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      // Move obstacles
      setObstacles((prev) =>
        prev
          .map((o) => ({ ...o, y: o.y + speed }))
          .filter((o) => o.y < GAME_HEIGHT)
      );

      // Add new obstacle (Pokéball)
      if (Math.random() < 0.05) {
        setObstacles((prev) => [
          ...prev,
          { x: Math.random() * (GAME_WIDTH - 40), y: 0 },
        ]);
      }

      // Increase score
      setScore((prev) => prev + 1);
    }, 50);

    return () => clearInterval(interval);
  }, [gameOver, speed]);

  // Difficulty scaling
  useEffect(() => {
    if (score - lastSpeedUpScore >= 200) {
      setSpeed((s) => s + 1);
      setLastSpeedUpScore(score);
    }
  }, [score, lastSpeedUpScore]);

  // Collision detection
 useEffect(() => {
  obstacles.forEach((o) => {
    const HITBOX_MARGIN = 10; // smaller touching range

    const playerLeft = playerX + HITBOX_MARGIN;
    const playerRight = playerX + PLAYER_SIZE - HITBOX_MARGIN;
    const playerTop = GAME_HEIGHT - PLAYER_SIZE + HITBOX_MARGIN;
    const playerBottom = GAME_HEIGHT - 10 - HITBOX_MARGIN; // same as before minus margin

    const obstacleLeft = o.x + HITBOX_MARGIN;
    const obstacleRight = o.x + 40 - HITBOX_MARGIN;
    const obstacleTop = o.y + HITBOX_MARGIN;
    const obstacleBottom = o.y + 40 - HITBOX_MARGIN;

    const isColliding =
      playerLeft < obstacleRight &&
      playerRight > obstacleLeft &&
      playerTop < obstacleBottom &&
      playerBottom > obstacleTop;

    if (isColliding) {
      setGameOver(true);
    }
  });
}, [obstacles, playerX]);

  // Save score for user
  useEffect(() => {
    if (gameOver && user) {
      const allScores = JSON.parse(localStorage.getItem("pokemonScores")) || {};
      const userScores = allScores[user.email] || {};
      userScores.dodge = Math.max(userScores.dodge || 0, score);
      allScores[user.email] = { ...userScores, username: user.username };
      localStorage.setItem("pokemonScores", JSON.stringify(allScores));
    }
  }, [gameOver, score, user]);

  const restart = () => {
    setPlayerX(GAME_WIDTH / 2 - PLAYER_SIZE / 2);
    setObstacles([]);
    setScore(0);
    setSpeed(4);
    setGameOver(false);
    setLastSpeedUpScore(0);
  };

  if (!user) return null;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚡ Pokémon Dodge Arena 🔥</h1>
      <h2>Player: {user.username}</h2>
      <h2>Score: {score}</h2>

      <div style={styles.gameArea}>
        {/* Player */}
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
          alt="player"
          style={{
            ...styles.player,
            left: playerX,
            transition: "left 0.1s",
          }}
        />

        {/* Obstacles - Pokéballs */}
        {obstacles.map((o, i) => (
          <img
            key={i}
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
            alt="pokeball"
            style={{
              ...styles.pokeball,
              left: o.x,
              top: o.y,
            }}
          />
        ))}
      </div>

      {/* On-Screen Controls */}
      {!gameOver && (
        <div style={styles.controls}>
          <button
            style={styles.button}
            onClick={() => setPlayerX((x) => Math.max(PLAYER_MARGIN, x - 20))}
          >
            ◀️ Left
          </button>
          <button
            style={styles.button}
            onClick={() =>
              setPlayerX((x) =>
                Math.min(GAME_WIDTH - PLAYER_SIZE - PLAYER_MARGIN, x + 20)
              )
            }
          >
            Right ▶️
          </button>
        </div>
      )}

      {gameOver && (
        <div style={styles.gameOver}>
          <h2 style={{ color: "red" }}>💀 GAME OVER</h2>
          <p>🔥 Your Score: {score}</p>
          <button onClick={restart} style={styles.button}>
            Restart
          </button>
          <button onClick={() => navigate("/")} style={styles.button}>
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    background: "linear-gradient(180deg, #000 0%, #111 100%)",
    color: "#00ff99",
    minHeight: "100vh",
    fontFamily: "Arial",
    padding: "20px",
  },
  title: {
    textShadow: "0 0 10px lime, 0 0 20px #00ff99",
  },
  gameArea: {
    position: "relative",
    width: "100%",
    maxWidth: "600px",
    height: "600px",
    margin: "20px auto",
    borderRadius: "20px",
    border: "3px solid #00ff99",
    boxShadow: "0 0 30px #00ff99",
    overflow: "hidden",
    background: "#111",
  },
  player: {
    position: "absolute",
    bottom: "10px",
    width: "70px",
    filter: "drop-shadow(0 0 10px #ffea00)",
  },
  pokeball: {
    position: "absolute",
    width: "40px",
    height: "40px",
  },
  controls: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    gap: "20px",
  },
  gameOver: { marginTop: "20px" },
  button: {
    padding: "10px 20px",
    margin: "5px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    background: "linear-gradient(90deg,#00ff99,#00b386)",
    fontWeight: "bold",
    color: "#000",
    boxShadow: "0 0 10px #00ff99",
  },
};

export default DodgeGame;