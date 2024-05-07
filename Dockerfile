FROM node:alpine as develoment
WORKDIR /usr/src/app
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:alpine as production
WORKDIR /usr/src/app
COPY package.json ./
COPY package-lock.json ./
RUN npm install --only-production
COPY --from=develoment /usr/src/app/dist ./dist
EXPOSE 4000
CMD ["node", "dist/src/main"]