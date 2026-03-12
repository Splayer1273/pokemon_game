import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ZombieGame() {
  const navigate = useNavigate();

  const [player, setPlayer] = useState({ x: 50, y: 50 });
  const [zombies, setZombies] = useState([{ x: 10, y: 10, hp: 1, speed: 1 }]);
  const [bullets, setBullets] = useState([]);
  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const moveSpeed = 3;
  const bulletSpeed = 2;

  // Detect Mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load user
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("pokemonCurrentUser"));
    if (!currentUser) navigate("/auth");
    else setUser(currentUser);
  }, [navigate]);

  // Restart Game
  const restart = () => {
    setPlayer({ x: 50, y: 50 });
    setZombies([{ x: 10, y: 10, hp: 1, speed: 1 }]);
    setBullets([]);
    setScore(0);
    setHp(100);
    setGameOver(false);
  };

  // Movement
  const moveUp = () => {
    if (!gameOver) setPlayer(p => ({ ...p, y: Math.max(0, p.y - moveSpeed) }));
  };

  const moveDown = () => {
    if (!gameOver) setPlayer(p => ({ ...p, y: Math.min(100, p.y + moveSpeed) }));
  };

  const moveLeft = () => {
    if (!gameOver) setPlayer(p => ({ ...p, x: Math.max(0, p.x - moveSpeed) }));
  };

  const moveRight = () => {
    if (!gameOver) setPlayer(p => ({ ...p, x: Math.min(100, p.x + moveSpeed) }));
  };

  const shoot = () => {
    if (!gameOver) setBullets(prev => [...prev, { x: player.x, y: player.y }]);
  };

  // Keyboard controls
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
      setScore(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver]);

  // Game Loop
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {

      // Move zombies
      setZombies(prev =>
        prev.map(z => {
          const dx = player.x - z.x;
          const dy = player.y - z.y;

          const distance = Math.sqrt(dx * dx + dy * dy) || 1;

          if (distance < 5) {
            setHp(prev => Math.max(prev - 10, 0));
          }

          return {
            ...z,
            x: z.x + (dx / distance) * z.speed,
            y: z.y + (dy / distance) * z.speed,
          };
        })
      );

      // Move bullets
      setBullets(prev =>
        prev
          .map(b => ({ ...b, y: b.y - bulletSpeed }))
          .filter(b => b.y > 0)
      );

      // Collision
      setZombies(prev => {
        let newZ = [];
        let bonus = 0;

        prev.forEach(z => {
          const hit = bullets.some(
            b => Math.abs(b.x - z.x) < 5 && Math.abs(b.y - z.y) < 5
          );

          if (hit) bonus += 5;
          else newZ.push(z);
        });

        if (bonus > 0) setScore(s => s + bonus);

        return newZ;
      });

      // Spawn zombies
      if (Math.random() < 0.03) {
        setZombies(prev => [
          ...prev,
          {
            x: Math.random() * 90,
            y: Math.random() * 90,
            hp: 1,
            speed: 1
          }
        ]);
      }

    }, 100);

    return () => clearInterval(interval);

  }, [player, bullets, gameOver]);

  // Game Over
  useEffect(() => {
    if (hp <= 0 && !gameOver) setGameOver(true);
  }, [hp]);

  if (!user) return null;

  return (
    <div style={styles.container}>

      <h1 style={{ fontSize: "clamp(22px,4vw,50px)" }}>
        🧟 Pokémon Zombie Apocalypse ⚡
      </h1>

      <div style={styles.stats}>
        <span>HP: {hp}</span>
        <span>Score: {score}</span>
      </div>

      <div style={styles.gameWrapper}>
        <div style={styles.gameArea}>

          {/* Player */}
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
            alt="player"
            style={{
              ...styles.player,
              left: `${player.x}%`,
              top: `${player.y}%`
            }}
          />

          {/* Zombies */}
          {zombies.map((z, i) => (
            <img
              key={i}
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
              alt="zombie"
              style={{
                ...styles.zombie,
                left: `${z.x}%`,
                top: `${z.y}%`
              }}
            />
          ))}

          {/* Bullets */}
          {bullets.map((b, i) => (
            <div
              key={i}
              style={{
                ...styles.bullet,
                left: `${b.x}%`,
                top: `${b.y}%`
              }}
            />
          ))}

        </div>
      </div>

      {/* Mobile Controls */}
      {isMobile && !gameOver && (
        <div style={styles.mobileControls}>
          <div style={styles.row}>
            <button style={styles.mobileBtn} onTouchStart={moveUp}>⬆</button>
          </div>

          <div style={styles.row}>
            <button style={styles.mobileBtn} onTouchStart={moveLeft}>⬅</button>
            <button style={styles.mobileBtn} onTouchStart={shoot}>🔥</button>
            <button style={styles.mobileBtn} onTouchStart={moveRight}>➡</button>
          </div>

          <div style={styles.row}>
            <button style={styles.mobileBtn} onTouchStart={moveDown}>⬇</button>
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameOver && (
        <div style={styles.gameOverOverlay}>
          <div style={styles.gameOverBox}>
            <h2 style={{ fontSize: "clamp(26px,5vw,60px)" }}>Game Over 😭</h2>

            <button style={styles.btn} onClick={restart}>
              Play Again
            </button>

            <button
              style={{ ...styles.btn, marginLeft: 10 }}
              onClick={() => navigate("/")}
            >
              🏠 Back Home
            </button>
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
    padding: "clamp(10px,2vw,30px)",
    fontFamily: "Arial",
    background: "radial-gradient(circle,#0a0a0a 40%,#111 100%)"
  },

  stats: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: "1vh",
    fontSize: "clamp(16px,2vw,28px)",
    fontWeight: "bold"
  },

  gameWrapper: {
    width: "95vw",
    maxWidth: "1000px",
    margin: "auto"
  },

  gameArea: {
    position: "relative",
    width: "100%",
    aspectRatio: "4/3",
    borderRadius: "20px",
    border: "3px solid #00ff99",
    boxShadow: "0 0 30px #00ff99",
    overflow: "hidden",
    background: "#111"
  },

  player: {
    position: "absolute",
    transform: "translate(-50%,-50%)",
    width: "clamp(35px,7vw,80px)"
  },

  zombie: {
    position: "absolute",
    transform: "translate(-50%,-50%)",
    width: "clamp(25px,5vw,60px)"
  },

  bullet: {
    position: "absolute",
    background: "yellow",
    transform: "translate(-50%,-50%)",
    width: "clamp(4px,1vw,10px)",
    height: "clamp(10px,3vh,20px)"
  },

  mobileControls: {
    marginTop: "3vh"
  },

  row: {
    display: "flex",
    justifyContent: "center",
    gap: "clamp(10px,5vw,40px)",
    margin: "1vh 0"
  },

  mobileBtn: {
    fontSize: "clamp(18px,6vw,40px)",
    padding: "clamp(8px,2vw,18px) clamp(12px,4vw,25px)",
    borderRadius: "15px",
    border: "none",
    background: "linear-gradient(90deg,#00ff99,#00b386)",
    fontWeight: "bold"
  },

  btn: {
    fontSize: "clamp(16px,2vw,28px)",
    padding: "clamp(10px,1vw,18px) clamp(20px,2vw,30px)",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(90deg,#00ff99,#00b386)",
    fontWeight: "bold"
  },

  gameOverOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },

  gameOverBox: {
    textAlign: "center",
    color: "#fff",
    padding: "clamp(20px,3vw,40px)"
  }
};

export default ZombieGame;