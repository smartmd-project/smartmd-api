# Repository Guidelines

## Cấu Trúc Dự Án & Tổ Chức Module

Đây là backend NestJS. Mã nguồn nằm trong `src/`, chia theo module:

- `src/auth/`: xác thực, JWT cookie, refresh token, GitHub OAuth, DTO, guard, strategy.
- `src/user/`: controller/service cho user và DTO cập nhật.
- `src/note/`: CRUD ghi chú, render Markdown và DTO.
- `src/common/`: service dùng chung, global guard, decorator, type chung.
- `prisma/schema.prisma`: schema database và Prisma model.

`dist/` là mã đã build, không chỉnh sửa trực tiếp. Asset hiện có gồm `smartMD.png`.

## Lệnh Build, Test & Chạy Local

- `npm run start:dev`: chạy app Nest ở chế độ watch.
- `npm run build`: biên dịch project bằng Nest CLI.
- `npm run start:prod`: chạy bản build từ `dist/main`.
- `npm run test`: chạy unit test bằng Jest.
- `npm run test:e2e`: chạy end-to-end test với cấu hình `test/jest-e2e.json`.
- `npm run test:cov`: chạy test kèm báo cáo coverage.
- `npm run format`: format `src/**/*.ts` và `test/**/*.ts` bằng Prettier.
- `npm run lint`: chạy ESLint với auto-fix.

Dùng `docker-compose.yml` khi cần hạ tầng local như database.

## Quy Ước Code & Đặt Tên

Viết TypeScript với indent 2 spaces, single quote, semicolon, trailing comma và giới hạn 100 ký tự mỗi dòng theo `.prettierrc`. Giữ quy ước NestJS: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.guard.ts`, `*.strategy.ts`; DTO đặt trong `dto/`.

Ưu tiên dependency injection. Logic riêng nằm trong module tương ứng; logic tái sử dụng đặt trong `src/common/`.

## Hướng Dẫn Testing

Jest là framework test chính. Đặt unit test cạnh file nguồn hoặc trong cấu trúc song song, dùng mẫu `*.spec.ts`. Ưu tiên test service, guard, luồng auth và logic Prisma. Chạy `npm run test` trước khi gửi thay đổi; dùng `npm run test:cov` cho refactor lớn.

## Quy Ước Commit & Pull Request

Lịch sử commit theo Conventional Commit, ví dụ `feat(auth): add OAuth github and change password`. Viết message ngắn, có type và scope nếu cần: `feat(note): ...`, `fix(auth): ...`, `chore: ...`.

Pull request nên có tóm tắt, module bị ảnh hưởng, kết quả test và issue liên quan nếu có. Với thay đổi API, ghi rõ route mới, request/response và biến môi trường cần thêm.

## Bảo Mật & Cấu Hình

Giữ secret trong `.env` và không commit credential thật. OAuth cần `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` và `GITHUB_CALLBACK_URL`. Khi test local qua HTTP, lưu ý cookie có `secure: true` có thể không được browser lưu.
