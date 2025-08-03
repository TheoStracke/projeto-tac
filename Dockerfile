# Multi-stage build: Frontend + Backend
FROM node:20-alpine AS frontend-build

# Build do Frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

# Build do Backend
FROM maven:3.9.6-eclipse-temurin-17 AS backend-build

WORKDIR /app

# Copy Maven files
COPY pom.xml ./
COPY src/ ./src/

# Copy frontend build to static resources
COPY --from=frontend-build /app/frontend/dist/ ./src/main/resources/static/

# Build backend
RUN mvn clean package -DskipTests

# Final runtime image
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads

# Copy JAR from build stage
COPY --from=backend-build /app/target/*.jar app.jar

# Set JVM options for container
ENV JAVA_OPTS="-Xmx512m -Xms256m"

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
