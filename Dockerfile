# Etapa 1: compila o projeto com Maven
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q package -DskipTests

# Etapa 2: imagem leve só com o Java para rodar
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Em produção: console do H2 desligado e sem log de SQL
ENV SPRING_H2_CONSOLE_ENABLED=false \
    SPRING_JPA_SHOW_SQL=false \
    JAVA_TOOL_OPTIONS="-Xmx350m -XX:+UseSerialGC"

EXPOSE 8081
CMD ["java", "-jar", "app.jar"]
