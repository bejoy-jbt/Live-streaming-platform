# Live Streaming Platform

A browser-based live streaming platform built with WebRTC, Node.js, Socket.IO, and React. Stream directly from your webcam without requiring external tools like OBS Studio.

## Features

- Stream directly from your browser using WebRTC
- Real-time peer-to-peer video transmission
- Public and private streaming support
- Multiple viewers can watch a single stream
- Low latency streaming
- Docker containerized deployment
- AWS EC2 ready
- TURN/STUN server integration for NAT traversal

## Tech Stack

**Frontend:**
- React
- Vite
- Socket.IO Client
- SimplePeer (WebRTC)

**Backend:**
- Node.js
- Express
- Socket.IO
- SimplePeer

**Infrastructure:**
- Docker & Docker Compose
- Coturn (TURN/STUN server)
- AWS EC2

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker >= 20.10
- Docker Compose >= 2.0

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/bejoy-jbt/live-streaming-platform.git
cd live-streaming-platform

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access the application:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

### Manual Setup

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

**Backend (.env):**
```env
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
NODE_ENV=development
```

**Frontend (.env):**
```env
VITE_SIGNALING_URL=http://localhost:4000
```

## Project Structure

```
live-streaming-platform/
├── backend/
│   ├── src/
│   │   └── index.js
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── CreateStream.jsx
│   │   │   ├── JoinStream.jsx
│   │   │   └── StreamPlayer.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── api.js
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## AWS EC2 Deployment

### 1. Launch EC2 Instance

- OS: Ubuntu 22.04 LTS
- Instance Type: t2.medium or larger
- Configure Security Group with these ports:
  - 22 (SSH)
  - 4000 (Backend)
  - 5173 (Frontend)
  - 3478 (TURN/STUN)
  - 49152-65535 (WebRTC media - UDP)

### 2. Install Docker

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Deploy Application

```bash
# Clone repository
git clone https://github.com/bejoy-jbt/live-streaming-platform.git
cd live-streaming-platform

# Update docker-compose.yml with your EC2 public IP
nano docker-compose.yml

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

### 4. Update docker-compose.yml for Production

Replace `YOUR_EC2_IP` in docker-compose.yml with your actual EC2 public IP address in:
- `FRONTEND_ORIGIN`
- `VITE_SIGNALING_URL`
- Coturn `--realm` and `--external-ip`

## API Endpoints

### Create Stream
```http
POST /streams
Content-Type: application/json

{
  "title": "My Stream",
  "isPublic": true
}
```

### Get Active Streams
```http
GET /streams
```

## Socket.IO Events

**Client to Server:**
- `viewer-join` - Viewer joins a stream
- `signal` - WebRTC signaling data

**Server to Client:**
- `viewer-join` - New viewer joined
- `signal` - WebRTC signaling data

## Usage

### Starting a Stream

1. Go to homepage
2. Click "Create Stream"
3. Allow camera/microphone permissions
4. Click "Start Stream"
5. Share the stream ID with viewers

### Joining a Stream

1. Go to homepage
2. Click "Join Stream" or browse public streams
3. Enter stream ID (or select from list)
4. Click "Join"

## Troubleshooting

### Cannot connect to backend
```bash
# Check if services are running
docker-compose ps

# Check logs
docker-compose logs backend
```

### WebRTC connection fails
- Verify TURN server is running
- Check firewall/security group settings
- Ensure UDP ports 49152-65535 are open

### Video not displaying
- Check browser permissions for camera/microphone
- Open browser console for errors
- Verify WebRTC peer connection in console

## Docker Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Rebuild containers
docker-compose up -d --build

# Stop and remove containers
docker-compose down

# Remove everything including volumes
docker-compose down -v
```

## Development

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Run in development mode
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

## Security Considerations

- Change default TURN server secret in production
- Use HTTPS in production (add Nginx reverse proxy)
- Implement user authentication
- Rate limit API endpoints
- Validate all user inputs

## Performance Optimization

- Use a CDN for frontend assets
- Enable compression on backend
- Implement connection pooling
- Monitor resource usage
- Scale horizontally with load balancer

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

Bejoy JBT 

## Acknowledgments

- WebRTC community
- Socket.IO team
- SimplePeer library
- Instrumentisto for Coturn Docker image

## Support

For issues and questions, please open an issue on GitHub.
