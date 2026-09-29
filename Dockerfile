# Tóm tắt: Build portfolio React thành static bundle rồi serve bằng Nginx.
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN node scripts/verify-lfs-assets.js
# Chặn deploy khi lint/test lỗi (repo không có CI riêng; Jenkins build image này).
RUN npm run lint && npm test
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
