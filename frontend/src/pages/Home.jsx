import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Home(){
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const navigate = useNavigate();
  return (
    <div>
      <h2>Join a Stream</h2>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Enter Code</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={joinCode}
            onChange={e => setJoinCode(e.target.value)}
            placeholder="Enter stream code"
            style={{ padding: 8 }}
          />
          <button onClick={async () => {
            setJoinError("");
            const code = (joinCode || "").trim().toUpperCase();
            if (!code) return;
            try {
              const res = await api.get(`/streams/${code}`);
              navigate(`/stream/${res.data.id}`);
            } catch (e) {
              setJoinError("Stream not found. Check the code and try again.");
            }
          }}>Join</button>
        </div>
        {joinError && <p style={{ color: "crimson" }}>{joinError}</p>}
      </div>
      <Link to="/create"><button>Create a stream</button></Link>
    </div>
  );
}
