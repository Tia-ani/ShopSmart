# 🐾 Pawfect FurEver

A personalized e-commerce platform for pet owners built with Full Stack DevOps practices.

## Features

- JWT-based authentication
- Pet profile onboarding (type & breed)
- Personalized product recommendations
- Shopping cart and checkout
- Order tracking
- Responsive UI

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB (ready for integration)
- **DevOps**: Docker, Docker Compose, GitHub Actions

## Quick Start

### Using Docker Compose (Recommended)

```bash
docker-compose up --build
```

Access the application:
- Frontend: http://localhost
- Backend API: http://localhost:3000
- MongoDB: localhost:27017

### Local Development

#### Backend
```bash
cd server
npm install
npm run dev
```

#### Frontend
```bash
cd client
npm install
npm run dev
```

## Environment Variables

### Server (.env)
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://admin:password123@localhost:27017/pawfect?authSource=admin
```

### Client (.env)
```
VITE_API_URL=http://localhost:3000
```

## Docker Commands

Build images:
```bash
docker-compose build
```

Start services:
```bash
docker-compose up
```

Stop services:
```bash
docker-compose down
```

Remove volumes:
```bash
docker-compose down -v
```

## CI/CD

GitHub Actions workflow automatically builds and pushes Docker images to GitHub Container Registry on push to main/develop branches.

## Project Structure

```
.
├── client/              # React frontend
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf
├── server/              # Express backend
│   ├── src/
│   └── Dockerfile
├── docker-compose.yml
└── .github/workflows/
```

## License

MIT
