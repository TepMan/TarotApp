# syntax=docker/dockerfile:1

FROM maven:3.9.11-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY backend/pom.xml backend/pom.xml
COPY backend/src backend/src
RUN mvn -f backend/pom.xml -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /workspace/backend/target/*.jar /app/app.jar
COPY static/card_images/720px /app/static/card_images/720px

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

