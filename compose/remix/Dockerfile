# compose/remix/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./

# Install corepack and yarn v4
RUN corepack enable && \
	yarn set version stable && \
	yarn config set nodeLinker node-modules

# ★修正: --immutable, --production, --ignore-engines を削除しました
RUN yarn install --network-timeout 100000 && \
	yarn cache clean

# Copy Remix application files and configs
COPY app/ ./app/
# Assuming there's a public directory for assets like logos
COPY public/ ./public/ 
COPY postcss.config.js ./
COPY tailwind.config.ts ./
COPY tsconfig.json ./
COPY vite.config.ts ./

