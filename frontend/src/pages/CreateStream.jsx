import React, { useRef, useState } from "react";
import { api } from "../api";
import io from "socket.io-client";
import SimplePeer from "simple-peer/simplepeer.min.js";

export default function CreateStream(){
  const videoRef = useRef();
  const [socket, setSocket] = useState(null);
  const [streamInfo, setStreamInfo] = useState(null);
  const peersRef = useRef(new Map()); // viewerId -> SimplePeer

  async function start(){
    // Create stream on server
    const res = await api.post("/streams", { title: "My Stream", isPublic: true });
    setStreamInfo(res.data);

    // get camera
    const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoRef.current.srcObject = media;
    videoRef.current.muted = true;
    await videoRef.current.play();

    // connect socket
    const sig = io(api.defaults.baseURL);
    setSocket(sig);

    sig.on("connect", () => {
      console.log("[publisher] socket connected", sig.id);
      sig.emit("publisher-join", { streamId: res.data.id });
    });
    sig.on("connect_error", (e) => console.error("[publisher] connect_error", e));

    // When a viewer joins, publisher will receive 'viewer-joined' (see backend)
    sig.on("viewer-joined", ({ viewerId }) => {
      console.log("[publisher] viewer-joined", viewerId);
      // create a peer (initiator = true) to connect to viewer
      const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream: media,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" }
          ]
        }
      });
      peersRef.current.set(viewerId, peer);
      peer.on("signal", data => {
        console.log("[publisher] sending offer/ice to", viewerId);
        sig.emit("signal", { to: viewerId, signal: data });
      });
      // when we receive viewer's signals via server, relay into peer
      const handler = ({ from, signal }) => {
        if (from === viewerId) {
          try {
            console.log("[publisher] applying viewer signal", { from });
            peer.signal(signal);
          } catch (e) {
            console.error("[publisher] peer.signal error", e);
          }
        }
      };
      if (typeof handler === 'function') {
        sig.on("signal", handler);
      } else {
        console.error("[publisher] handler is not a function", handler);
      }
      peer.on("close", () => {
        sig.off("signal", handler);
        peersRef.current.delete(viewerId);
      });
      peer.on("error", (e) => console.error("[publisher] peer error", e));
    });

  }

  return (
    <div>
      <h2>Create Stream</h2>
      <div className="card">
        <video ref={videoRef} autoPlay playsInline width="640" height="480" />
      </div>
      <button onClick={start}>Start Stream</button>
      {streamInfo && (
        <p>
          Stream Code: <strong>{streamInfo.code}</strong>
          {" "}|{" "}
          <a href={`/stream/${streamInfo.id}`} target="_blank" rel="noreferrer">
            Open viewer in new tab
          </a>
        </p>
      )}
    </div>
  );
}
