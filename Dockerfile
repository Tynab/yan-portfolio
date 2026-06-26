# Tóm tắt: Image chạy portfolio React bằng dependency đúng từ package-lock.
FROM node:22-alpine

WORKDIR /app

ENV HOST=0.0.0.0
ENV PATH=/app/node_modules/.bin:$PATH

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
