# Phasmophobia Investigation Journal

Web tra cứu 30 loại ma trong Phasmophobia (tiếng Việt), giao diện sổ tay.

## Cấu trúc

- `index.html` — toàn bộ giao diện + logic (web tĩnh).
- `phasmophobia_ghosts_vi.json` — dữ liệu 30 loại ma.
- `phasmophobia_tools_and_cursed_vi.json` — dữ liệu dụng cụ + đồ nguyền rủa.
- `app.py` — server Python tùy chọn để chạy local offline.

## Chạy local

Mở trực tiếp `index.html`, hoặc chạy server nhỏ:

```bash
python app.py
```

rồi mở `http://127.0.0.1:8080`.

## Deploy Vercel

Đây là web tĩnh (HTML + JSON), không cần build. Import repo này vào Vercel là chạy ngay.
