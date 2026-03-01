import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function ZombieGame() {
  const navigate = useNavigate();
  const PLAYER_SIZE = 50; // hitbox chota kela, image size same
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

  const moveSpeed = 12;
  const bulletSpeed = 12;

  const joystickRef = useRef(null);
  const [joystick, setJoystick] = useState({ dx: 0, dy: 0, active: false });

  // Detect Mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
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

  // Player movement based on joystick
  useEffect(() => {
    if (!joystick.active || gameOver) return;
    const interval = setInterval(() => {
      setPlayer((p) => {
        let newX = p.x + joystick.dx * moveSpeed;
        let newY = p.y + joystick.dy * moveSpeed;
        newX = Math.max(0, Math.min(BASE_WIDTH - PLAYER_SIZE, newX));
        newY = Math.max(0, Math.min(BASE_HEIGHT - PLAYER_SIZE, newY));
        return { x: newX, y: newY };
      });
    }, 50);
    return () => clearInterval(interval);
  }, [joystick, gameOver]);

  // Shoot bullets in 360° towards joystick direction
  const shoot = () => {
    if (gameOver) return;
    let angle = Math.atan2(joystick.dy, joystick.dx);
    if (!joystick.active) angle = -Math.PI / 2; // default shoot up
    setBullets((prev) => [
      ...prev,
      { x: player.x + PLAYER_SIZE / 2, y: player.y + PLAYER_SIZE / 2, angle },
    ]);
  };

  // Keyboard Controls
  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;
      if (e.key === "ArrowUp") setPlayer((p) => ({ ...p, y: Math.max(0, p.y - moveSpeed) }));
      if (e.key === "ArrowDown") setPlayer((p) => ({ ...p, y: Math.min(BASE_HEIGHT - PLAYER_SIZE, p.y + moveSpeed) }));
      if (e.key === "ArrowLeft") setPlayer((p) => ({ ...p, x: Math.max(0, p.x - moveSpeed) }));
      if (e.key === "ArrowRight") setPlayer((p) => ({ ...p, x: Math.min(BASE_WIDTH - PLAYER_SIZE, p.x + moveSpeed) }));
      if (e.key === " ") shoot();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [player, gameOver, joystick]);

  // Auto score
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => setScore((prev) => prev + 1), 1000);
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
          if (distance < 35) setHp((prev) => Math.max(prev - 10, 0)); // player hitbox chota
          return { ...z, x: z.x + (dx / distance) * z.speed, y: z.y + (dy / distance) * z.speed };
        })
      );

      setBullets((prev) =>
        prev.map((b) => ({
          ...b,
          x: b.x + Math.cos(b.angle) * bulletSpeed,
          y: b.y + Math.sin(b.angle) * bulletSpeed,
        })).filter((b) => b.x > 0 && b.y > 0 && b.x < BASE_WIDTH && b.y < BASE_HEIGHT)
      );

      setZombies((prevZombies) => {
        let newZombies = [];
        let bonusScore = 0;
        prevZombies.forEach((z) => {
          const hit = bullets.some((b) => Math.abs(b.x - z.x) < 25 && Math.abs(b.y - z.y) < 25);
          if (hit) bonusScore += 5;
          else newZombies.push(z);
        });
        if (bonusScore > 0) setScore((prev) => prev + bonusScore);
        return newZombies;
      });

      if (Math.random() < 0.03) {
        setZombies((prev) => [
          ...prev,
          { x: Math.random() * (BASE_WIDTH - 40), y: Math.random() * (BASE_HEIGHT - 40), hp: 1, speed: 2 },
        ]);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [player, bullets, gameOver]);

  useEffect(() => { if (hp <= 0 && !gameOver) setGameOver(true); }, [hp]);

  const restartGame = () => {
    setPlayer({ x: 400, y: 300 });
    setZombies([{ x: 100, y: 100, hp: 1, speed: 2 }]);
    setBullets([]);
    setScore(0);
    setHp(100);
    setGameOver(false);
  };

  if (!user) return null;

  const handleJoystickMove = (e) => {
    e.preventDefault();
    const rect = joystickRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    let clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let dx = clientX - cx;
    let dy = clientY - cy;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 30) { dx = (dx / distance) * 30; dy = (dy / distance) * 30; }
    setJoystick({ dx: dx / 30, dy: dy / 30, active: true });
  };

  const stopJoystick = () => setJoystick({ dx: 0, dy: 0, active: false });

  return (
    <div style={styles.container}>
      <h1>🧟 Pokémon Zombie Apocalypse ⚡</h1>
      <div style={styles.stats}><span>HP: {hp}</span><span>Score: {score}</span></div>

      <div style={styles.gameWrapper}>
        <div style={styles.gameArea}>
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" alt="player" style={{ ...styles.player, left: `${(player.x / BASE_WIDTH) * 100}%`, top: `${(player.y / BASE_HEIGHT) * 100}%` }} />
          {zombies.map((z, i) => <img key={i} src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" alt="zombie" style={{ ...styles.zombie, left: `${(z.x / BASE_WIDTH) * 100}%`, top: `${(z.y / BASE_HEIGHT) * 100}%` }} />)}
          {bullets.map((b, i) => <div key={i} style={{ ...styles.bullet, left: `${(b.x / BASE_WIDTH) * 100}%`, top: `${(b.y / BASE_HEIGHT) * 100}%` }} />)}
        </div>
      </div>

      {gameOver && (
        <div style={styles.gameOverBox}>
          <h2>💀 Game Over</h2>
          <p>Your Score: {score}</p>
          <div style={styles.gameOverButtons}>
            <button style={styles.actionBtn} onClick={restartGame}>🔄 Restart</button>
            <button style={styles.actionBtn} onClick={() => navigate("/")}>🏠 Back To Home</button>
          </div>
        </div>
      )}

      {isMobile && !gameOver && (
        <div style={styles.mobileControls}>
          <div ref={joystickRef} style={styles.joystick}
            onTouchStart={handleJoystickMove} onTouchMove={handleJoystickMove} onTouchEnd={stopJoystick}
            onMouseDown={handleJoystickMove} onMouseMove={(e)=>joystick.active && handleJoystickMove(e)} onMouseUp={stopJoystick}>
            <div style={{ ...styles.joystickKnob, transform: `translate(${joystick.dx*30}px, ${joystick.dy*30}px)` }} />
          </div>
          <button style={styles.fireBtn} onTouchStart={shoot}>🔥</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { textAlign: "center", color: "#fff", minHeight: "100vh", padding: "10px", background: "radial-gradient(circle, #0a0a0a 40%, #111 100%)" },
  stats: { display: "flex", justifyContent: "space-around", marginBottom: "10px", fontWeight: "bold" },
  gameWrapper: { width: "100%", maxWidth: "900px", margin: "auto" },
  gameArea: { position: "relative", width: "100%", aspectRatio: "4 / 3", borderRadius: "20px", border: "3px solid #00ff99", boxShadow: "0 0 30px #00ff99", overflow: "hidden", background: "#111" },
  player: { position: "absolute", width: "8%", transform: "translate(-50%, -50%)" },
  zombie: { position: "absolute", width: "5%", transform: "translate(-50%, -50%)" },
  bullet: { position: "absolute", width: "0.8%", height: "3%", background: "yellow", transform: "translate(-50%, -50%)" },
  gameOverBox: { marginTop: "20px", padding: "20px", background: "rgba(0,0,0,0.8)", borderRadius: "15px" },
  gameOverButtons: { display: "flex", justifyContent: "center", gap: "15px", marginTop: "15px", flexWrap: "wrap" },
  actionBtn: { padding: "12px 20px", fontWeight: "bold", borderRadius: "12px", border: "none", background: "linear-gradient(90deg,#ff4d4d,#cc0000)", color: "#fff", cursor: "pointer" },
  mobileControls: { marginTop: "20px", display: "flex", justifyContent: "space-between", padding: "0 20px", alignItems: "center" },
  joystick: { width: "80px", height: "80px", borderRadius: "50%", background: "rgba(0,255,153,0.3)", position: "relative", touchAction: "none" },
  joystickKnob: { width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(145deg,#00ff99,#00b386)", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
  fireBtn: { fontSize: "22px", padding: "12px 20px", borderRadius: "50%", border: "none", background: "linear-gradient(145deg,#ff4d4d,#cc0000)", fontWeight: "bold" },
};

export default ZombieGame;