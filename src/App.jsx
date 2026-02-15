import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import  DodgeGame from "./pages/DodgeGame";

import Auth from "./pages/Auth";
import Home from "./pages/Home";
import CatchPokemon from "./pages/catchpokemon";
import ZombiePokemon from "./pages/zombipockemon";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/catch" element={<CatchPokemon />} />
        <Route path="/zombie" element={<ZombiePokemon />} />
         <Route path="/dodge" element={<DodgeGame />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/auth" element={<Auth />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
