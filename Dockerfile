FROM node:20-alpine
WORKDIR hieulth/backend
COPY package*.json ./
RUN npm install --legacy-peer-deps
RUN npm i -g @nestjs/cli@11.0.0
COPY . .
RUN npm run build
CMD ["node", "dist/main.js"]