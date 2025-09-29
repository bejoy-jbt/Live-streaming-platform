const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN || "*",
    methods: ["GET", "POST"]
  }
});

/**
 * In-memory streams store (for demo). For production use a DB.
 * stream = {
 *   id, code, title, owner, isPublic, createdAt, publisherSocketId
 * }
 */
const streams = new Map();

app.get("/streams", (req, res) => {
  // For privacy: do not list public streams
  res.json([]);
});

app.post("/streams", (req, res) => {
  const { title = "Untitled", isPublic = true, owner = "anon" } = req.body;
  const id = uuidv4();
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const stream = { id, code, title, owner, isPublic, createdAt: Date.now(), publisherSocketId: null };
  streams.set(id, stream);
  res.json(stream);
});

app.get("/streams/:code", (req, res) => {
  const code = req.params.code.toUpperCase();
  const entry = Array.from(streams.values()).find(s => s.code === code);
  if (!entry) return res.status(404).json({ error: "Stream not found" });
  res.json(entry);
});

// Socket.IO for signaling
io.on("connection", socket => {
  console.log("Socket connected:", socket.id);

  // Publisher registers itself to a stream id
  socket.on("publisher-join", ({ streamId }) => {
    const stream = streams.get(streamId);
    if (stream) {
      stream.publisherSocketId = socket.id;
      streams.set(streamId, stream);
      socket.join(streamId);
      console.log(`Publisher joined stream ${streamId}`, socket.id);
      io.to(streamId).emit("stream-updated", stream);
    }
  });

  // Viewer requests to join -> server notifies publisher
  socket.on("viewer-join", ({ streamId }) => {
    const stream = streams.get(streamId);
    if (!stream) {
      socket.emit("error", { message: "Stream not found" });
      return;
    }
    // create a viewer room (joining streamId as room is fine)
    socket.join(streamId);
    // notify publisher (if exists) that a new viewer wants to connect
    if (stream.publisherSocketId) {
      io.to(stream.publisherSocketId).emit("viewer-joined", { viewerId: socket.id });
    } else {
      // No publisher yet
      socket.emit("no-publisher");
    }
  });

  // Generic signaling relay: from -> to with payload
  // payload: { toSocketId, fromSocketId (optional), signalData }
  socket.on("signal", ({ to, signal }) => {
    if (!to) return;
    io.to(to).emit("signal", { from: socket.id, signal });
  });

  socket.on("disconnect", () => {
    // Clean up publisher references if any
    for (const [id, s] of streams.entries()) {
      if (s.publisherSocketId === socket.id) {
        // Remove entire stream entry so nothing is retained in memory
        streams.delete(id);
        io.to(id).emit("stream-updated", { ...s, publisherSocketId: null });
      }
    }
    console.log("Socket disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Backend listening on ${PORT}`);
});
