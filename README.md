<p align="center">
  <img src="smartmd-logo.png" alt="smartMD logo" width="180" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger" />
  <img src="https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Compose" />
</p>

# SmartMD-Api

Backend NestJS cho ứng dụng soạn thảo Markdown smartMD. Hệ thống xử lý xác thực bằng
JWT cookie, GitHub OAuth, quản lý người dùng, CRUD ghi chú, render Markdown sang HTML,
import file Markdown và kiểm tra ngữ pháp qua LanguageTool.

## Yêu Cầu

- Node.js
- npm
- Docker và Docker Compose nếu muốn chạy PostgreSQL local bằng container

## Cài Đặt

```bash
npm install
```

Tạo file `.env` ở thư mục gốc:

```env
PORT=4000
CLIENT_URL=http://localhost:5173

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smartmd

ACCESS_TOKEN_SECRET=change_me_access_secret
ACCESS_TOKEN_EXPIRES_IN=15m

REFRESH_TOKEN_SECRET=change_me_refresh_secret
REFRESH_TOKEN_EXPIRES_IN=7d

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:4000/auth/github/callback
```

## Chạy Database Local

```bash
docker compose up -d
```

PostgreSQL mặc định:

- Host: `localhost`
- Port: `5432`
- User: `postgres`
- Password: `postgres`
- Database: `smartmd`

## Prisma

Generate Prisma Client:

```bash
npx prisma generate
```

Chạy migration local:

```bash
npx prisma migrate dev
```

Mở Prisma Studio:

```bash
npx prisma studio
```

## Chạy Backend

Chạy development mode:

```bash
npm run start:dev
```

Backend mặc định chạy tại:

```text
http://localhost:4000
```

Nếu đổi `PORT` trong `.env`, URL backend sẽ đổi theo port đó.

## Swagger API Docs

Swagger UI:

```text
http://localhost:4000/api-docs
```

OpenAPI JSON cho frontend đọc:

```text
http://localhost:4000/api-docs-json
```

Khi làm frontend Vue, có thể đưa URL OpenAPI JSON này cho Codex để tạo API client.

## Cấu Hình Frontend Vue

Backend dùng HTTP-only cookie để lưu `access_token` và `refresh_token`, nên frontend cần
gửi request kèm credentials.

Ví dụ với Axios:

```ts
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true,
});
```

Ví dụ với `fetch`:

```ts
await fetch('http://localhost:4000/auth/signin', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email,
    password,
  }),
});
```

## API Chính

### Authentication

- `POST /auth/signup`: đăng ký tài khoản
- `POST /auth/signin`: đăng nhập bằng email/password
- `POST /auth/signout`: đăng xuất và xóa cookie
- `POST /auth/refresh-token`: cấp lại access token bằng refresh token cookie
- `POST /auth/change-password`: đổi mật khẩu
- `GET /auth/github`: bắt đầu GitHub OAuth
- `GET /auth/github/callback`: callback GitHub OAuth

### User

- `GET /user/me`: lấy thông tin user hiện tại
- `PATCH /user/me`: cập nhật tên user hiện tại

### Note

- `GET /note`: lấy danh sách ghi chú
- `GET /note/:id`: lấy chi tiết ghi chú
- `POST /note`: tạo ghi chú
- `PATCH /note/:id`: cập nhật ghi chú
- `DELETE /note/:id`: xóa ghi chú
- `GET /note/render/:id`: render Markdown sang HTML đã sanitize
- `POST /note/check-grammar`: kiểm tra ngữ pháp
- `POST /note/import`: import file Markdown

## Scripts

```bash
npm run start:dev
```

Chạy app ở development mode.

```bash
npm run build
```

Build project ra `dist/`.

```bash
npm run start:prod
```

Chạy bản build production.

```bash
npm run test
```

Chạy unit test bằng Jest.

```bash
npm run test:e2e
```

Chạy end-to-end test.

```bash
npm run test:cov
```

Chạy test kèm coverage.

```bash
npm run lint
```

Chạy ESLint với auto-fix.

```bash
npm run format
```

Format code bằng Prettier.

## Lưu Ý Bảo Mật

- Không commit file `.env` hoặc credential thật.
- Cookie đang dùng HTTP-only để giảm rủi ro XSS đọc token.
- Khi frontend chạy khác origin, backend cần `CLIENT_URL` đúng với URL frontend.
- Ở local HTTP, nếu cookie `secure: true`, browser có thể không lưu cookie. Nên cấu hình
  `secure` phụ thuộc môi trường khi chuẩn bị chạy production/local tách biệt.

## Workflow Gợi Ý

```bash
docker compose up -d
npx prisma migrate dev
npm run start:dev
```

Sau đó mở:

```text
http://localhost:4000/api-docs
```

Để frontend đọc API contract:

```text
http://localhost:4000/api-docs-json
```
