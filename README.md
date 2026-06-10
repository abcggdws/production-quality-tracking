# Production Quality Tracking System

A full-stack production work reporting and quality traceability system built with Node.js, TypeScript, and React.

## Project Structure

```
production-quality-tracking/
├── backend/                 # Node.js + TypeScript backend
│   ├── src/
│   │   ├── config/          # Configuration loading
│   │   ├── controllers/     # Route controllers
│   │   ├── db/              # Database initialization and seeding
│   │   ├── middleware/      # Authentication middleware
│   │   ├── models/          # TypeScript interfaces
│   │   ├── repositories/    # Data access layer (JSON file storage)
│   │   ├── routes/          # API route registration
│   │   ├── services/        # Business logic layer
│   │   ├── utils/           # Utility functions
│   │   └── main.ts          # Application entry point
│   └── package.json
├── frontend/                # React + TypeScript frontend
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── hooks/          # React hooks
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   ├── App.tsx         # Root component
│   │   └── main.tsx        # Application entry point
│   └── package.json
├── docker-compose.yml       # Docker setup
├── LICENSE
└── NOTICE
```

## Tech Stack

### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **HTTP Server**: Native Node.js HTTP module
- **Data Storage**: JSON file persistence
- **Testing**: Jest

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **State Management**: TanStack Query v5

## Features

### Core Functionality
- Production order management with status tracking
- Quality inspection records with pass/fail/rework results
- Defect entry tracking with severity levels
- Rework order management
- Quality score calculation
- Real-time alerts for quality issues

### API Endpoints
- `GET /api/v1/orders` - List production orders
- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders/:id` - Get order by ID
- `POST /api/v1/quality-records` - Create quality record
- `GET /api/v1/rework-orders` - List rework orders
- `GET /api/v1/alerts` - List quality alerts
- `PATCH /api/v1/alerts/:id/acknowledge` - Acknowledge alert

## Getting Started

### Prerequisites
- Node.js 18+

### Backend Setup

```bash
cd backend
npm install

# Initialize database files
npm run db:init

# Seed sample data (optional)
npm run db:seed

# Build the project
npm run build

# Start production server
npm start

# Or start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

The backend reads configuration from environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| APP_HOST | Server host | 0.0.0.0 |
| APP_PORT | Server port | 3001 |
| DATA_DIR | Data directory | ./data |

## Development

### Running Tests

Backend:
```bash
cd backend
npm test
```

Frontend:
```bash
cd frontend
npm test
```

### Building for Production

Backend:
```bash
cd backend
npm run build
```

Frontend:
```bash
cd frontend
npm run build
```

## Data Schema

### JSON Files
- `production_orders.json` - Production order information
- `quality_records.json` - Quality inspection records
- `defect_entries.json` - Individual defect entries
- `rework_orders.json` - Rework order tracking
- `quality_alerts.json` - Quality alerts
- `users.json` - User authentication data

## License

MIT
