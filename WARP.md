# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

- Build JAR
  - Unix:
    ```sh path=null start=null
    ./mvnw clean package
    ```
  - Windows (PowerShell):
    ```powershell path=null start=null
    .\mvnw.cmd clean package
    ```

- Run the app (dev)
  - Unix:
    ```sh path=null start=null
    ./mvnw spring-boot:run
    ```
  - Windows:
    ```powershell path=null start=null
    .\mvnw.cmd spring-boot:run
    ```

- Run tests
  - All tests:
    ```sh path=null start=null
    ./mvnw test
    ```
  - Single test class:
    ```sh path=null start=null
    ./mvnw -Dtest=ClassName test
    ```
  - Single test method:
    ```sh path=null start=null
    ./mvnw -Dtest=ClassName#methodName test
    ```

- Run the packaged JAR
  ```sh path=null start=null
  java -jar target/ProyectoFinal-DWI-0.0.1-SNAPSHOT.jar
  ```

- Lint/format
  - No lint or format plugins are configured in `pom.xml`.

- Override runtime config (examples)
  ```sh path=null start=null
  # change server port
  SERVER_PORT=8080 ./mvnw spring-boot:run

  # override datasource (Spring Boot env keys)
  SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/yourdb \
  SPRING_DATASOURCE_USERNAME=youruser \
  SPRING_DATASOURCE_PASSWORD=yourpass \
  ./mvnw spring-boot:run
  ```

## High-level architecture

- Framework and build
  - Spring Boot 3 (parent: `spring-boot-starter-parent`), Java 17, Maven wrapper present (`mvnw`, `mvnw.cmd`).
  - Starters: Web, Data JPA, Test. Database driver: PostgreSQL. Lombok for boilerplate.

- Application entry point
  - `src/main/java/org/example/proyectofinaldwi/ProyectoFinalDwiApplication.java` bootstraps the app.

- Configuration
  - `src/main/resources/application.properties` sets:
    - `server.port=8083`
    - PostgreSQL datasource keys (`spring.datasource.*`)
    - JPA: PostgreSQL dialect, `spring.jpa.hibernate.ddl-auto=update`, `spring.jpa.show-sql=true`.

- Domain model (JPA entities)
  - `Usuario`, `Pelicula`, `Funcion`, `Reserva`, `Entrada` under `model/` with Lombok annotations.
  - Relationships:
    - `Pelicula` 1..n `Funcion` (LAZY).
    - `Funcion` m..1 `Pelicula`; 1..n `Reserva`.
    - `Usuario` 1..n `Reserva`.
    - `Reserva` m..1 `Usuario`, m..1 `Funcion`, 1..n `Entrada`.
    - `Entrada` m..1 `Reserva` via `reservaId` column; entity holds both FK field and relation (`insertable=false, updatable=false`).

- Persistence
  - Repositories extend `JpaRepository` per aggregate: `UsuarioRepository`, `PeliculaRepository`, `FuncionRepository`, `ReservaRepository`, `EntradaRepository`.
  - Custom finder: `EntradaRepository.findByReserva_ReservaId(Long)` and `existsByCodigoEntrada(String)`.

- Services (business logic)
  - Thin CRUD services for each entity.
  - `ReservaService.save(reserva)`
    - Transactional.
    - Computes `precioTotal = cantidadEntradas * 15.00`.
    - After persisting the `Reserva`, auto-creates `cantidadEntradas` `Entrada` rows if none exist.
  - `EntradaService.save(entrada)`
    - Generates unique `codigoEntrada` with `ENT-<UUID8>` if missing.
    - Sets default `precio = 15.00` if missing.

- Web layer (REST controllers)
  - Controllers under `controller/` expose CRUD endpoints at `/api/{usuarios|peliculas|funciones|reservas|entradas}` using standard HTTP verbs.
  - Basic request validation is performed inline in controllers (required fields, simple constraints), returning `400 Bad Request` on violations.

- Testing
  - `spring-boot-starter-test` is present; no `src/test/java` found yet. Use the test commands above and add tests under `src/test/java` as needed.
