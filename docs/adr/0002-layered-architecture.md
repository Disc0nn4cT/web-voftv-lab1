# ADR 0002 — Шарова архітектура (domain / application / infrastructure / client)

- Дата: 2025-11-23
- Статус: Accepted
- Автор: Viktor Hlukhmaniuk

## Контекст

Після вибору модульного моноліту потрібні чіткі «рейки» всередині одного застосунку, щоб уникати «big ball of mud».  
У проєкті вже є директорії:

- `server/src/domain/` — доменні моделі (наприклад, `Signal`).
- `server/src/application/` — use cases (`CreateSignal`, `GetSignals`).
- `server/src/infrastructure/` — робота з БД (`db/`) та HTTP-роутери (`http/`).
- `client/` — веб-клієнт (координати, панелі гри).

Необхідно зафіксувати правила, щоб надалі їх не ламати.

## Рішення

Вводимо чіткі шари:

- **Domain (`server/src/domain/`)**
  - Чисті доменні сутності та інтерфейси репозиторіїв.
  - Не знають про Express, SQLite або HTTP.
  - Приклад: `Signal`, `ISignalRepo`.

- **Application (`server/src/application/`)**
  - Сценарії використання (use cases).
  - Координують роботу домену та інфраструктури через абстракції (інтерфейси репо).
  - Не знають про конкретні транспорт/БД-технології.
  - Приклад: `CreateSignal(repo, dto)`, `GetSignals(repo, options)`.

- **Infrastructure (`server/src/infrastructure/`)**
  - Реалізації інтерфейсів (`SignalRepoSqlite`), налаштування Express, HTTP-роутери.
  - Тут дозволено залежати від Express, SQLite, файлової системи.
  - Приклади: `db/sqlite.js`, `db/SignalRepoSqlite.js`, `http/signals.routes.js`, `http/admin.routes.js`.

- **Client (`client/`)**
  - Статичні файли фронтенду.
  - Звертаються до HTTP-API (`/signal`, `/signals`, `/health`) через fetch.

### Допустимі залежності

- `domain` → ні від кого (чистий центр).
- `application` → `domain`.
- `infrastructure` → `application`, `domain`, зовнішні бібліотеки (Express, sqlite3).
- `client` → HTTP API (через URL), але не напряму до `server/src`.

**Заборонені залежності:**

- `domain` не може імпортувати нічого з `application` або `infrastructure`.
- `application` не може імпортувати Express / sqlite напряму.
- `client` не має читати файли зі `server/src/` або використовувати Node-модулі клієнтським кодом.

## Наслідки

Плюси:

- Код легше читати та пояснювати на захисті (є чітка мапа «де що лежить»).
- Легше замінити інфраструктуру (SQLite → інша БД) без змін у `domain` і мінімальних у `application`.
- `client` може еволюціонувати незалежно (наприклад, перехід на React/SPA, але API лишається тим самим).

Мінуси:

- Є невеликий оверхед на створення додаткових файлів (use cases, інтерфейси).
- Іноді прості речі виглядають «занадто складно» для маленького демо, але це оплата за структурованість.
