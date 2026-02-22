.PHONY: install dev build docker-up docker-down clean test

# Install dependencies
install:
	cd backend && npm install

# Run development server
dev:
	cd backend && npm run dev

# Build Docker image
build:
	docker-compose build

# Start Docker services
docker-up:
	docker-compose up -d

# Stop Docker services
docker-down:
	docker-compose down

# View logs
logs:
	docker-compose logs -f

# Clean up
clean:
	rm -rf backend/node_modules
	docker-compose down -v

# Run tests
test:
	cd backend && npm test
