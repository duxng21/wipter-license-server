# Wipter Node Tool License Server

Vercel API + Supabase quản lý license lifetime theo mô hình **1 key = 1 thiết bị**.

## Deploy

1. Tạo Supabase project và chạy [schema.sql](./schema.sql) trong SQL Editor.
2. Push riêng nội dung folder này lên GitHub.
3. Import repository vào Vercel.
4. Cấu hình các biến trong `.env.example` tại Project Settings > Environment Variables.
5. Deploy và gửi URL dạng `https://your-project.vercel.app/api` để cấu hình Electron client.

## Environment

- `SUPABASE_URL`: URL project Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: service role key, tuyệt đối không đưa vào Electron/GitHub public.
- `ADMIN_SECRET`: mật khẩu dài, ngẫu nhiên để vào `/admin`.
- `ALLOWED_ADMIN_ORIGIN`: URL Vercel production (dành cho hardening tiếp theo).

## Endpoints

- `POST /api/activate`
- `POST /api/verify`
- `GET /api/update/latest`
- `/api/admin/*` yêu cầu header `X-Admin-Secret`.

Admin console: `/admin`.

## Security

- Bật RLS cho tables; server dùng service role.
- Không commit `.env` hoặc secret thật.
- Rotate `ADMIN_SECRET` định kỳ.
- Client chỉ nhận public license state, không nhận Supabase credentials.
