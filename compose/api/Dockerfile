# compose/api/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Install corepack and yarn v4
RUN corepack enable && \
	yarn set version stable && \
	yarn config set nodeLinker node-modules

# ★追加: curlのインストール
RUN apk add --no-cache curl

# Copy package.json and install dependencies
COPY package.json ./
RUN yarn install --network-timeout 100000 && \
	yarn cache clean

# Copy source code and tsconfig
COPY src/ ./src/
COPY tsconfig.json ./