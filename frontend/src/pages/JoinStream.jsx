import React, { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function JoinStream(){
  const params = useParams();
  const nav = useNavigate();

  useEffect(() => {
    // redirect to stream page by code -> server provides stream id
    (async () => {
      try {
        const res = await api.get(`/streams/${params.code}`);
        nav(`/stream/${res.data.id}`);
      } catch (e) {
        alert("Stream not found");
        nav("/");
      }
    })();
  }, []);

  return <div>Joining...</div>;
}
