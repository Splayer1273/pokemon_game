import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ZombieGame() {
  const navigate = useNavigate();

  const PLAYER_SIZE = 70;
  const BASE_WIDTH = 800;
  const BASE_HEIGHT = 600;

  const [player, setPlayer] = useState({ x: 400, y: 300 });
  const [zombies, setZombies] = useState([{ x: 100, y: 100, hp: 1, speed: 2 }]);
  const [bullets, setBullets] = useState([]);
  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const moveSpeed = 15;
  const bulletSpeed = 10;

  // Detect Mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load User
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("pokemonCurrentUser"));
    if (!currentUser) navigate("/auth");
    else setUser(currentUser);
  }, [navigate]);

  // Movement
  const moveUp = () => {
    if (gameOver) return;
    setPlayer((p) => ({ ...p, y: Math.max(0, p.y - moveSpeed) }));
  };
  const moveDown = () => {
    if (gameOver) return;
    setPlayer((p) => ({ ...p, y: Math.min(BASE_HEIGHT - PLAYER_SIZE, p.y + moveSpeed) }));
  };
  const moveLeft = () => {
    if (gameOver) return;
    setPlayer((p) => ({ ...p, x: Math.max(0, p.x - moveSpeed) }));
  };
  const moveRight = () => {
    if (gameOver) return;
    setPlayer((p) => ({ ...p, x: Math.min(BASE_WIDTH - PLAYER_SIZE, p.x + moveSpeed) }));
  };
  const shoot = () => {
    if (gameOver) return;
    setBullets((prev) => [...prev, { x: player.x + PLAYER_SIZE / 2, y: player.y }]);
  };

  // Keyboard
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowUp") moveUp();
      if (e.key === "ArrowDown") moveDown();
      if (e.key === "ArrowLeft") moveLeft();
      if (e.key === "ArrowRight") moveRight();
      if (e.key === " ") shoot();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [player, gameOver]);

  // Auto score
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setScore((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  // Game Loop
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setZombies((prevZombies) =>
        prevZombies.map((z) => {
          const dx = player.x - z.x;
          const dy = player.y - z.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;

          if (distance < 40) setHp((prev) => Math.max(prev - 10, 0));

          return {
            ...z,
            x: z.x + (dx / distance) * z.speed,
            y: z.y + (dy / distance) * z.speed,
          };
        })
      );

      setBullets((prev) =>
        prev.map((b) => ({ ...b, y: b.y - bulletSpeed })).filter((b) => b.y > 0)
      );

      setZombies((prevZombies) => {
        let newZombies = [];
        let bonusScore = 0;

        prevZombies.forEach((z) => {
          const hit = bullets.some(
            (b) => Math.abs(b.x - z.x) < 25 && Math.abs(b.y - z.y) < 25
          );

          if (hit) {
            bonusScore += 5;
          } else newZombies.push(z);
        });

        if (bonusScore > 0) setScore((prev) => prev + bonusScore);

        return newZombies;
      });

      if (Math.random() < 0.03) {
        setZombies((prev) => [
          ...prev,
          {
            x: Math.random() * (BASE_WIDTH - 40),
            y: Math.random() * (BASE_HEIGHT - 40),
            hp: 1,
            speed: 2,
          },
        ]);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [player, bullets, gameOver]);

  useEffect(() => {
    if (hp <= 0 && !gameOver) setGameOver(true);
  }, [hp]);

  if (!user) return null;

  return (
    <div style={styles.container}>
      <h1>🧟 Pokémon Zombie Apocalypse ⚡</h1>

      <div style={styles.stats}>
        <span>HP: {hp}</span>
        <span>Score: {score}</span>
      </div>

      <div style={styles.gameWrapper}>
        <div style={styles.gameArea}>
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
            alt="player"
            style={{
              ...styles.player,
              left: `${(player.x / BASE_WIDTH) * 100}%`,
              top: `${(player.y / BASE_HEIGHT) * 100}%`,
            }}
          />

          {zombies.map((z, i) => (
            <img
              key={i}
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
              alt="zombie"
              style={{
                ...styles.zombie,
                left: `${(z.x / BASE_WIDTH) * 100}%`,
                top: `${(z.y / BASE_HEIGHT) * 100}%`,
              }}
            />
          ))}

          {bullets.map((b, i) => (
            <div
              key={i}
              style={{
                ...styles.bullet,
                left: `${(b.x / BASE_WIDTH) * 100}%`,
                top: `${(b.y / BASE_HEIGHT) * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      {isMobile && !gameOver && (
        <div style={styles.mobileControls}>
          <div style={styles.row}>
            <button style={styles.btn} onTouchStart={moveUp}>⬆</button>
          </div>
          <div style={styles.row}>
            <button style={styles.btn} onTouchStart={moveLeft}>⬅</button>
            <button style={styles.btn} onTouchStart={shoot}>🔥</button>
            <button style={styles.btn} onTouchStart={moveRight}>➡</button>
          </div>
          <div style={styles.row}>
            <button style={styles.btn} onTouchStart={moveDown}>⬇</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    color: "#fff",
    minHeight: "100vh",
    padding: "10px",
    fontFamily: "Arial",
    background: "radial-gradient(circle, #0a0a0a 40%, #111 100%)",
  },
  stats: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: "10px",
    fontSize: "18px",
    fontWeight: "bold",
  },
  gameWrapper: {
    width: "100%",
    maxWidth: "900px",
    margin: "auto",
  },
  gameArea: {
    position: "relative",
    width: "100%",
    aspectRatio: "4 / 3",
    borderRadius: "20px",
    border: "3px solid #00ff99",
    boxShadow: "0 0 30px #00ff99",
    overflow: "hidden",
    background: "#111",
  },
  player: {
    position: "absolute",
    width: "8%",
    transform: "translate(-50%, -50%)",
  },
  zombie: {
    position: "absolute",
    width: "5%",
    transform: "translate(-50%, -50%)",
  },
  bullet: {
    position: "absolute",
    width: "0.8%",
    height: "3%",
    background: "yellow",
    transform: "translate(-50%, -50%)",
  },
  mobileControls: {
    marginTop: "20px",
  },
  row: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    margin: "8px",
  },
  btn: {
    fontSize: "22px",
    padding: "12px 20px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(90deg,#00ff99,#00b386)",
    fontWeight: "bold",
  },
};

export default ZombieGame;