# Tóm tắt: Build portfolio React thành static bundle rồi serve bằng Nginx (kèm HEALTHCHECK /healthz).
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN node scripts/verify-lfs-assets.js
# Chặn đẩy image lỗi: lint/test chạy ngay trong build (job CI cũng chạy, nhưng image
# build bằng workflow Deploy hay build tay đều phải tự qua bước này).
RUN npm run lint && npm test
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
# Docker tự đánh dấu container healthy/unhealthy; workflow Deploy chờ "healthy" rồi mới coi là
# deploy thành công (lỗi thì rollback). nginx:alpine có sẵn wget của busybox, không cần cài curl.
# Shell form có chủ đích: "|| exit 1" quy mọi mã lỗi của wget về 1 (= unhealthy theo quy ước Docker).
# hadolint ignore=DL3025
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
CMD ["nginx", "-g", "daemon off;"]
