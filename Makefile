# .envファイルを読み込む (ファイルが存在する場合のみ)
-include .env
export

# Composeファイルの変数を定義
COMPOSE_BASE := -f docker-compose.yml
COMPOSE_DEV := $(COMPOSE_BASE) -f docker-compose.dev.yml
COMPOSE_PROD := $(COMPOSE_BASE) -f docker-compose.prod.yml

.PHONY: help init make-secret up-dev down-dev logs-dev ps-dev up-prod down-prod logs-prod ps-prod build-prod migrate-prod

help:
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "--- 🛠️ Utility Commands ---"
	@echo "  init          Initialize project (copy dev.env to .env and generate JWT secret)"
	@echo "  make-secret   Generate a new JWT secret"
	@echo ""
	@echo "--- ⚙️ Development Commands ---"
	@echo "  up-dev        Start development containers"
	@echo "  down-dev      Stop development containers"
	@echo "  logs-dev      View logs for development containers"
	@echo "  ps-dev        List development containers"
	@echo ""
	@echo "--- 📦 Production Commands ---"
	@echo "  up-prod       Start production containers"
	@echo "  down-prod     Stop production containers"
	@echo "  logs-prod     View logs for production containers"
	@echo "  ps-prod       List production containers"
	@echo "  build-prod    Build images for production"
	@echo "  migrate-prod  Run database migrations for production"
	@echo ""

# --- 🚀 Starter Commands ---
init:
	@echo "Initializing project..."
	@if [ ! -f .env ]; then cp dev.env .env; else echo ".env already exists, skipping copy."; fi
	@echo "JWT_SECRET=$$(node -e "console.log(require('crypto').randomBytes(256).toString('base64'));")" >> .env
	@echo "Generated JWT_SECRET and appended to .env"
	@echo "Run 'make up-dev' to start the development environment."

# --- 🛠️ Utility Commands ---
make-secret:
	@echo "Generating new JWT_SECRET..."
	@node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"

# --- ⚙️ Development Commands ---
up-dev:
	docker compose $(COMPOSE_DEV) up --build -d

down-dev:
	docker compose $(COMPOSE_DEV) down --remove-orphans

logs-dev:
	docker compose $(COMPOSE_DEV) logs -f

ps-dev:
	docker compose $(COMPOSE_DEV) ps

# --- 📦 Production Commands ---
up-prod:
	docker compose $(COMPOSE_PROD) up --build -d

down-prod:
	docker compose $(COMPOSE_PROD) down --remove-orphans

logs-prod:
	docker compose $(COMPOSE_PROD) logs -f

ps-prod:
	docker compose $(COMPOSE_PROD) ps

build-prod:
	docker compose $(COMPOSE_PROD) build

migrate-prod:
	docker compose $(COMPOSE_PROD) run --rm orm npx prisma migrate deploy