# compose/orm/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Install corepack and yarn v4
RUN corepack enable && \
	yarn set version stable && \
	yarn config set nodeLinker node-modules

# Copy package.json and install dependencies (Prisma CLI etc.)
COPY package.json ./
# ★修正済み: --immutable, --production, --ignore-engines を削除しました
RUN yarn install --network-timeout 100000 && \
	yarn cache clean

# Copy Prisma schema and migrations (if any initially)
COPY prisma/ ./prisma/