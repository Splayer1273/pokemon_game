import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = (e) => {
    e.preventDefault();

    if (!form.username || !form.email || !form.password) {
      return alert("Please fill all fields");
    }

    localStorage.setItem("pokemonUser", JSON.stringify(form));
    alert("Signup Successful!");
    navigate("/login");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={styles.container}
    >
      <h1>📝 Sign Up</h1>

      <form onSubmit={handleSignup} style={styles.form}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          style={styles.input}
        />

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

        <button type="submit" style={styles.button}>
          Create Account
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </motion.div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg,#141e30,#243b55)",
    color: "white",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    width: "250px",
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
};

export default Signup;
