# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Tối ưu cache bằng cách copy package.json trước
COPY package*.json ./
RUN npm install

# Copy code và build
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:alpine
# Copy file đã build vào thư mục của Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Copy config nginx để xử lý SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
