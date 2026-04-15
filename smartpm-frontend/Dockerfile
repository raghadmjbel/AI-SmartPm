FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm config set registry https://registry.npmjs.org/ \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-factor 2 \
    && npm config set fetch-retry-mintimeout 1000 \
    && npm config set fetch-retry-maxtimeout 60000 \
    && npm ci --no-audit --progress=false

COPY . ./
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
