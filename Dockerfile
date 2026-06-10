FROM node:18-alpine

WORKDIR /app

COPY backend/package.json ./backend/
COPY backend/tsconfig.json ./backend/
COPY backend/src/ ./backend/src/

RUN cd backend && npm install && npm run build

EXPOSE 3001

CMD ["node", "backend/dist/main.js"]
