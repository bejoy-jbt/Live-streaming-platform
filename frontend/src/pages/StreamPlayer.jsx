import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import SimplePeer from "simple-peer/simplepeer.min.js";
import { api } from "../api";

export default function StreamPlayer(){
  const { id } = useParams();
  const videoRef = useRef();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let peer = null;
    const sig = io(api.defaults.baseURL);
    setSocket(sig);

    const attemptJoin = () => {
      console.log("[viewer] attempting join", id);
      sig.emit("viewer-join", { streamId: id });
    };

    sig.on("connect", () => {
      console.log("[viewer] socket connected", sig.id);
      attemptJoin();
    });
    sig.on("connect_error", (e) => console.error("[viewer] connect_error", e));

    // When publisher sends signals via server, we will create peer as non-initiator
    sig.on("signal", async ({ from, signal }) => {
      console.log("[viewer] received signal from", from);
      // If we already have peer, feed it; otherwise create a new peer
      if (!peer) {
        peer = new SimplePeer({
          initiator: false,
          trickle: false,
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" }
            ]
          }
        });
        peer.on("signal", data => {
          // send our answer back
          console.log("[viewer] sending answer/ice to", from);
          sig.emit("signal", { to: from, signal: data });
        });
        peer.on("stream", remoteStream => {
          videoRef.current.srcObject = remoteStream;
          videoRef.current.muted = true; // allow autoplay; user can unmute
          videoRef.current.play().catch(()=>{});
        });
        peer.on("error", (e) => console.error("[viewer] peer error", e));
      }
      try {
        peer.signal(signal);
      } catch (e) {
        console.warn("signal error", e);
      }
    });

    sig.on("no-publisher", () => {
      console.log("[viewer] no-publisher; will retry");
      setTimeout(attemptJoin, 1500);
    });

    sig.on("stream-updated", () => {
      console.log("[viewer] stream-updated; rejoining");
      attemptJoin();
    });

    return () => {
      if (peer) peer.destroy();
      sig.disconnect();
    };
  }, [id]);

  return (
    <div>
      <h2>Watching Stream</h2>
      <div className="card">
        <video ref={videoRef} autoPlay playsInline controls />
      </div>
    </div>
  );
}
