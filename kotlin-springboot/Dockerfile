FROM gradle:8-jdk21 AS builder
WORKDIR /app
COPY build.gradle.kts settings.gradle.kts ./
COPY src ./src
RUN gradle bootJar --no-daemon -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 3005
ENTRYPOINT ["java", "-jar", "app.jar"]
