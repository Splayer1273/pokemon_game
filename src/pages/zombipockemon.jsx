import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ZombieGame() {
  const navigate = useNavigate();

  const PLAYER_SIZE = 90;
  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;

  const [player, setPlayer] = useState({ x: 400, y: 300 });
  const [zombies, setZombies] = useState([{ x: 100, y: 100, hp: 1, speed: 2 }]);
  const [bullets, setBullets] = useState([]);
  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [user, setUser] = useState(null);

  const moveSpeed = 15;
  const bulletSpeed = 10;

  // Load current user
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("pokemonCurrentUser"));
    if (!currentUser) navigate("/auth");
    else setUser(currentUser);
  }, [navigate]);

  // Player movement and shoot
  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;
      if (e.key === "ArrowUp") setPlayer((p) => ({ ...p, y: Math.max(0, p.y - moveSpeed) }));
      if (e.key === "ArrowDown") setPlayer((p) => ({ ...p, y: Math.min(GAME_HEIGHT - PLAYER_SIZE, p.y + moveSpeed) }));
      if (e.key === "ArrowLeft") setPlayer((p) => ({ ...p, x: Math.max(0, p.x - moveSpeed) }));
      if (e.key === "ArrowRight") setPlayer((p) => ({ ...p, x: Math.min(GAME_WIDTH - PLAYER_SIZE, p.x + moveSpeed) }));
      if (e.key === " ") setBullets((prev) => [...prev, { x: player.x + PLAYER_SIZE / 2, y: player.y }]);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [player, gameOver]);

  // Increment score automatically over time
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setScore((prev) => prev + 1); // 1 point per second
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  // Game loop
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      // Move zombies
      setZombies((prevZombies) =>
        prevZombies.map((z) => {
          const dx = player.x - z.x;
          const dy = player.y - z.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 40) setHp((prev) => Math.max(prev - 10, 0));
          return { ...z, x: z.x + (dx / distance) * z.speed, y: z.y + (dy / distance) * z.speed };
        })
      );

      // Move bullets
      setBullets((prevBullets) => prevBullets.map((b) => ({ ...b, y: b.y - bulletSpeed })).filter((b) => b.y > 0));

      // Bullet collision
      setZombies((prevZombies) => {
        let newZombies = [];
        let bonusScore = 0;
        prevZombies.forEach((z) => {
          const hit = bullets.some((b) => Math.abs(b.x - z.x) < 25 && Math.abs(b.y - z.y) < 25);
          if (hit) {
            const newHp = z.hp - 1;
            if (newHp <= 0) bonusScore += 5; // extra points for destroying
            else newZombies.push({ ...z, hp: newHp });
          } else newZombies.push(z);
        });
        if (bonusScore > 0) setScore((prev) => prev + bonusScore);
        return newZombies;
      });

      // Spawn new zombies
      if (Math.random() < 0.03) {
        setZombies((prev) => [
          ...prev,
          { x: Math.random() * (GAME_WIDTH - 40), y: Math.random() * (GAME_HEIGHT - 40), hp: 1, speed: 2 },
        ]);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [player, bullets, gameOver]);

  // Game over check
  useEffect(() => {
    if (hp <= 0 && !gameOver) {
      setGameOver(true);
      saveScore();
    }
  }, [hp]);

  const saveScore = () => {
    if (!user) return;
    const allScores = JSON.parse(localStorage.getItem("pokemonScores")) || {};
    const userScores = allScores[user.email] || {};
    userScores.zombie = Math.max(userScores.zombie || 0, score);
    userScores.username = user.username;
    allScores[user.email] = userScores;
    localStorage.setItem("pokemonScores", JSON.stringify(allScores));
  };

  const restart = () => {
    setPlayer({ x: 400, y: 300 });
    setZombies([{ x: 100, y: 100, hp: 1, speed: 2 }]);
    setBullets([]);
    setScore(0);
    setHp(100);
    setGameOver(false);
  };

  if (!user) return null;

  return (
    <div style={styles.container}>
      <h1>🧟 Pokémon Zombie Apocalypse ⚡</h1>
      <div style={styles.stats}>
        <span>HP: {hp}</span>
        <span>Score: {score}</span>
      </div>

      <div style={styles.gameArea}>
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" alt="player" style={{ ...styles.player, left: player.x, top: player.y }} />
        {zombies.map((z, i) => (
          <img key={i} src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" alt="zombie" style={{ ...styles.zombie, left: z.x, top: z.y }} />
        ))}
        {bullets.map((b, i) => (
          <div key={i} style={{ ...styles.bullet, left: b.x, top: b.y }} />
        ))}
      </div>

      {gameOver && (
        <div style={styles.gameOver}>
          <h2>💀 GAME OVER</h2>
          <p>🧟 Your Score: {score}</p>
          <button style={styles.button} onClick={restart}>
            Restart
          </button>
          <button style={styles.button} onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { textAlign: "center", color: "#fff", minHeight: "100vh", padding: "10px", fontFamily: "Arial", background: "radial-gradient(circle, #0a0a0a 40%, #111 100%)" },
  stats: { display: "flex", justifyContent: "space-around", marginBottom: "10px", fontSize: "18px", fontWeight: "bold" },
  gameArea: { position: "relative", width: "800px", height: "600px", margin: "10px auto", borderRadius: "20px", border: "3px solid #00ff99", boxShadow: "0 0 30px #00ff99", overflow: "hidden", background: "#111" },
  player: { position: "absolute", width: "90px", filter: "drop-shadow(0 0 10px #ffea00)" },
  zombie: { position: "absolute", width: "40px", filter: "drop-shadow(0 0 8px red)" },
  bullet: { position: "absolute", width: "6px", height: "15px", background: "yellow", borderRadius: "3px" },
  gameOver: { marginTop: "20px" },
  button: { padding: "12px 25px", margin: "5px", borderRadius: "12px", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: "bold", background: "linear-gradient(90deg,#00ff99,#00b386)", color: "#000", boxShadow: "0 0 10px #00ff99" },
};

export default ZombieGame;
