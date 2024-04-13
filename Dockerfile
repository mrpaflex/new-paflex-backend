# Builder stage
FROM node:alpine as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm i -g @nestjs/cli
RUN npm ci --only=production
COPY . .
RUN npm run build

# Final stage
FROM node:alpine
WORKDIR /app
COPY package.json package-lock.json ./
ENV PORT=4000
ENV NODE_ENV=production
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE $PORT
ENTRYPOINT ["npm", "run", "start:prod"]
