# ========================================================
# Stage 1: Build the React + Vite Frontend
# ========================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ========================================================
# Stage 2: Build the Java Backend with Maven
# ========================================================
FROM maven:3.9.6-eclipse-temurin-17-alpine AS backend-builder
WORKDIR /app

COPY pom.xml ./
# Cache dependencies
RUN mvn dependency:go-offline -B || true

COPY src/ ./src/
RUN mvn clean package -DskipTests

# ========================================================
# Stage 3: Minimal Production Runtime
# ========================================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Install sqlite runtime dependencies
RUN apk add --no-cache libc6-compat

# Copy built fat jar
COPY --from=backend-builder /app/target/hostel-management-system-1.0.0.jar ./app.jar

# Copy built frontend assets so Java server can serve the UI
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Render sets PORT dynamically (defaults to 10000)
ENV PORT=10000
EXPOSE 10000

# Run in headless server-only mode
CMD ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar", "--server-only"]
