if (typeof global === 'undefined') {
  window.global = window;
}

import "./styles.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import CreateStream from "./pages/CreateStream";
import JoinStream from "./pages/JoinStream";
import StreamPlayer from "./pages/StreamPlayer";



function App(){
  return (
    <BrowserRouter>
      <nav className="nav">
        <Link to="/">Home</Link> | <Link to="/create">Create Stream</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/create" element={<CreateStream/>} />
        <Route path="/join/:code" element={<JoinStream/>} />
        <Route path="/stream/:id" element={<StreamPlayer/>} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<App />);
