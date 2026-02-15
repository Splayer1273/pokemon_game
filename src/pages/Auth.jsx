import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  // 🧠 Auto Redirect If Already Logged In
  useEffect(() => {
    const currentUser = localStorage.getItem("pokemonCurrentUser");
    if (currentUser) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.email || !form.password || (!isLogin && !form.username)) {
      return alert("Please fill all fields");
    }

    const users =
      JSON.parse(localStorage.getItem("pokemonUsers")) || [];

    if (isLogin) {
      // 🔐 LOGIN
      const validUser = users.find(
        (user) =>
          user.email === form.email &&
          user.password === form.password
      );

      if (!validUser) {
        return alert("Invalid Credentials");
      }

      localStorage.setItem(
        "pokemonCurrentUser",
        JSON.stringify(validUser)
      );

      navigate("/");
    } else {
      // 📝 SIGNUP
      const userExists = users.find(
        (user) => user.email === form.email
      );

      if (userExists) {
        return alert("User already exists!");
      }

      const newUser = {
        username: form.username,
        email: form.email,
        password: form.password,
      };

      users.push(newUser);

      localStorage.setItem(
        "pokemonUsers",
        JSON.stringify(users)
      );

      alert("Signup successful! Please login.");
      setIsLogin(true);

      // Clear username after signup
      setForm({
        username: "",
        email: form.email,
        password: "",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={styles.container}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
        style={styles.card}
      >
        <h1 style={styles.title}>
          {isLogin ? "🔐 Login" : "📝 Sign Up"}
        </h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              style={styles.input}
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            style={styles.input}
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            style={styles.button}
          >
            {isLogin ? "Login" : "Create Account"}
          </motion.button>
        </form>

        <p style={{ marginTop: "15px" }}>
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}
        </p>

        <button
          onClick={() => setIsLogin(!isLogin)}
          style={styles.switchBtn}
        >
          {isLogin ? "Sign Up" : "Login"}
        </button>
      </motion.div>
    </motion.div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg,#141e30,#243b55)",
  },

  card: {
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    padding: "40px",
    borderRadius: "20px",
    width: "300px",
    textAlign: "center",
    color: "white",
  },

  title: {
    marginBottom: "20px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  input: {
    padding: "10px",
    borderRadius: "10px",
    border: "none",
  },

  button: {
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    background: "#ffcc00",
    cursor: "pointer",
    fontWeight: "bold",
  },

  switchBtn: {
    marginTop: "10px",
    padding: "8px",
    borderRadius: "10px",
    border: "none",
    background: "#00ff99",
    cursor: "pointer",
  },
};

export default Auth;
