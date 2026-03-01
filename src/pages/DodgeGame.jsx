import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function DodgeGame() {
  const navigate = useNavigate();

  const [playerX, setPlayerX] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(4);
  const [gameOver, setGameOver] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Detect Mobile & set container size
  useEffect(() => {
    const checkResize = () => {
      setIsMobile(window.innerWidth <= 768);
      const width = Math.min(window.innerWidth - 20, 600);
      setContainerWidth(width);
      setContainerHeight(width); // square
      setPlayerX(width / 2 - 50 / 2);
    };
    checkResize();
    window.addEventListener("resize", checkResize);
    return () => window.removeEventListener("resize", checkResize);
  }, []);

  // Movement
  const moveLeft = () => {
    if (gameOver) return;
    setPlayerX((x) => Math.max(0, x - 20));
  };

  const moveRight = () => {
    if (gameOver) return;
    setPlayerX((x) => Math.min(containerWidth - 50, x + 20));
  };

  // Keyboard Control
  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;
      if (e.key === "ArrowLeft") moveLeft();
      if (e.key === "ArrowRight") moveRight();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameOver, containerWidth]);

  // Game Loop
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setObstacles((prev) =>
        prev
          .map((o) => ({ ...o, y: o.y + speed }))
          .filter((o) => o.y < containerHeight)
      );

      if (Math.random() < 0.05) {
        setObstacles((prev) => [
          ...prev,
          { x: Math.random() * (containerWidth - 40), y: 0 },
        ]);
      }

      setScore((prev) => prev + 1);
    }, 50);

    return () => clearInterval(interval);
  }, [gameOver, speed, containerWidth, containerHeight]);

  // Collision Detection
  useEffect(() => {
    obstacles.forEach((o) => {
      if (
        o.y + 40 > containerHeight - 50 &&
        o.x < playerX + 50 &&
        o.x + 40 > playerX
      ) {
        setGameOver(true);
      }
    });
  }, [obstacles, playerX, containerHeight]);

  const restart = () => {
    setPlayerX(containerWidth / 2 - 50 / 2);
    setObstacles([]);
    setScore(0);
    setSpeed(4);
    setGameOver(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚡ Pokémon Dodge Arena 🔥</h1>
      <h2>Score: {score}</h2>

      <div
        style={{
          ...styles.gameArea,
          width: containerWidth,
          height: containerHeight,
        }}
      >
        {/* Player */}
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
          alt="player"
          style={{
            ...styles.player,
            left: playerX,
            bottom: 0,
          }}
        />

        {/* Obstacles as Pokéballs */}
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

      {/* Mobile Controls */}
      {isMobile && !gameOver && (
        <div style={styles.mobileControls}>
          <button style={styles.controlButton} onTouchStart={moveLeft}>
            ⬅
          </button>
          <button style={styles.controlButton} onTouchStart={moveRight}>
            ➡
          </button>
        </div>
      )}

      {gameOver && (
        <div style={styles.gameOver}>
          <h2 style={{ color: "red" }}>💀 GAME OVER</h2>
          <p>Your Score: {score}</p>
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
    margin: "20px auto",
    borderRadius: "20px",
    border: "3px solid #00ff99",
    boxShadow: "0 0 30px #00ff99",
    overflow: "hidden",
    background: "#111",
  },
  player: {
    position: "absolute",
    width: 50,
    transition: "left 0.08s linear",
  },
  pokeball: {
    position: "absolute",
    width: 40,
    height: 40,
    transform: "translate(0,0)",
  },
  mobileControls: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    gap: "60px",
  },
  controlButton: {
    fontSize: "40px",
    padding: "20px 40px",
    borderRadius: "20px",
    border: "none",
    background: "linear-gradient(90deg,#00ff99,#00b386)",
    fontWeight: "bold",
  },
  gameOver: {
    marginTop: "20px",
  },
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
  },
};

export default DodgeGame;