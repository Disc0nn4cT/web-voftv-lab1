# ADR 0003 — CRUD API для сигналів (Signal)

- Дата: 2025-11-23
- Статус: Accepted
- Автор: Viktor Hlukhmaniuk

## Контекст

У проєкті основною сутністю є `Signal` — результат сканування неба (азимут, висота, сила сигналу, payload, час створення).  
У 3-й практиці вже реалізовано:

- `GET /signal?az=&el=` — створення нового сигналу за координатами (для першої панелі гри).
- `GET /signals` — отримання останніх сигналів.
- `GET /health` — базова перевірка стану.

Для 4-ї практики потрібно:

1. Описати контракт API у `docs/api/openapi.yaml` з повним CRUD.
2. Налаштувати реалізацію на бекенді відповідно до контракту.

## Рішення

Ввести REST-подібний CRUD навколо ресурсу **`Signal`**:

- `POST /signals` — створення сигналу.
- `GET /signals` — список останніх сигналів.
- `GET /signals/{id}` — деталі одного сигналу.
- `PATCH /signals/{id}` — часткове оновлення (наприклад, позначити тип/label або відредагувати payload).
- `DELETE /signals/{id}` — видалити сигнал.
- `GET /health` — простий health-check (повертає `{ "status": "ok" }` або `{ "ok": true }`).

При цьому зберігається існуючий `GET /signal?az=&el=` як **ігровий ендпоінт** для Coordinates panel (він може внутрішньо викликати той самий сценарій `CreateSignal`).

## Наслідки для коду

- Розширити домен і репозиторій `ISignalRepo` / `SignalRepoSqlite` методами:
  - `findById(id)`,
  - `update(id, partialData)`,
  - `delete(id)`.
- Додати use cases в `application/signals/`:
  - `GetSignalById`,
  - `UpdateSignal`,
  - `DeleteSignal`.
- Додати обробники в `infrastructure/http/signals.routes.js`:
  - `POST /signals`,
  - `GET /signals/:id`,
  - `PATCH /signals/:id`,
  - `DELETE /signals/:id`,
  - і забезпечити відповідність контракту `openapi.yaml`.

Це дозволяє:

- використовувати API як «звичайний» REST-сервіс (для майбутніх панелей Download/Processing/Reports),
- зберегти сумісність з уже написаною Coordinates panel (`GET /signal`).
