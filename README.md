# User CRUD API (NestJS)

A simple REST API for managing users, built with NestJS. Data is stored in an in-memory array — no database — so it resets whenever the server restarts.

## Setup

```bash
npm install
npm run start:dev   # dev mode with auto-reload
# or
npm run build && npm run start:prod
```

Server runs on `http://localhost:3000` by default (override with `PORT` env var).

## Endpoints

| Method | Route         | Description          | Body                                  |
|--------|---------------|-----------------------|----------------------------------------|
| GET    | `/users`      | List all users        | —                                      |
| GET    | `/users/:id`  | Get one user           | —                                      |
| POST   | `/users`      | Create a user          | `{ name, email, age? }`                |
| PATCH  | `/users/:id`  | Update a user (partial)| `{ name?, email?, age? }`              |
| DELETE | `/users/:id`  | Delete a user           | —                                      |

## Validation

- `name`: required, non-empty string
- `email`: required, must be a valid email, must be unique across users
- `age`: optional, must be a non-negative integer if provided
- Unknown fields in the request body are rejected (whitelist enforcement)

## Responses

- `404 Not Found` — user id doesn't exist
- `409 Conflict` — email already in use
- `400 Bad Request` — validation failure

## Structure

```
src/
  main.ts                    - bootstrap, global ValidationPipe
  app.module.ts               - root module
  users/
    user.entity.ts            - User shape
    users.controller.ts       - routes
    users.service.ts          - in-memory array + business logic
    users.module.ts
    dto/
      create-user.dto.ts
      update-user.dto.ts
```

## Next steps (when you're ready to move past the array)

Swap `UsersService`'s array for TypeORM/Prisma + a real database — the controller and DTOs don't need to change since the array is fully encapsulated inside the service.
