# syntax=docker/dockerfile:1
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY .env.dev ./
COPY index.html ./
COPY ./src ./src
COPY ./public ./public
RUN npm ci && npm run build -- --mode dev

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist .
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
