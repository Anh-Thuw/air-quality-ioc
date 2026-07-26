# 1. Dự án: Thu thập & Phân tích Dữ liệu Chất lượng Không khí — IOC Đà Nẵng

> Đề tài thực tập: *Tìm hiểu thu thập phân tích dữ liệu tại Trung tâm điều hành thành phố thông minh (IOC)*

## 2. Cấu trúc thư mục tổng quan

```
project-root/
├── backend/
│   ├── collector/
│   │   ├── services/
│   │   ├── utils/
│   │   └── jobs/
│   ├── database/
│   │   ├── schema/
│   │   ├── migrations/
│   │   └── seed/
│   ├── api/
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── models/
│   ├── ai-forecast/
│   │   ├── notebooks/
│   │   └── models/
│   ├── config/
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── store/
│   ├── .env.example
│   └── package.json
│
├── docs/
│   ├── architecture/
│   ├── screenshots/
│   └── report/
│
├── .gitignore
└── README.md
```

## 3. Chi tiết thư mục `backend/`

Backend đảm nhận toàn bộ phần "sau hậu trường": gọi API IQAir, xử lý dữ liệu, lưu MySQL, cung cấp API cho frontend, và thử nghiệm mô hình AI. Bên trong `backend/` chia thành 4 module con theo đúng lịch trình Tuần 3-4:

### 3.1. `backend/collector/` — Thu thập dữ liệu (Node.js + Axios)

| Thư mục | Vai trò |
|---|---|
| `services/` | Module gọi IQAir API (lấy dữ liệu theo tọa độ/thành phố, xử lý retry khi lỗi hoặc vượt rate limit). |
| `utils/` | Hàm làm sạch, chuẩn hóa dữ liệu JSON trả về (ép kiểu, xử lý giá trị `null`, chuyển đổi múi giờ UTC ↔ giờ VN). |
| `jobs/` | Cấu hình lịch chạy định kỳ (cron job) gọi API tự động theo chu kỳ (vd: mỗi 30 phút/1 giờ). |

**Quy ước đặt tên:** đặt tên file/hàm theo *chức năng* (vd: hàm gọi API đặt tên dạng "fetch + tên nguồn dữ liệu", hàm chuẩn hóa đặt tên dạng "normalize + tên đối tượng"), không đặt theo ngày viết code.

### 3.2. `backend/database/` — Thiết kế & quản lý MySQL

| Thư mục | Vai trò |
|---|---|
| `schema/` | File định nghĩa cấu trúc bảng gốc (`.sql`): stations, pollution_readings, weather_readings, forecasts, api_fetch_logs, dashboard_users. |
| `migrations/` | Mỗi lần thay đổi cấu trúc bảng, tạo 1 file mới đánh số thứ tự (`001_...`, `002_...`) để lưu lịch sử thay đổi CSDL. |
| `seed/` | Dữ liệu mẫu ban đầu (JSON từ IQAir) dùng để test trước khi có luồng dữ liệu thật liên tục. |

### 3.3. `backend/api/` — API phục vụ frontend

Chỉ nên phát triển **sau khi** `collector/` và `database/` đã chạy ổn định, vì phần này chỉ đọc dữ liệu đã được `collector` ghi sẵn vào MySQL.

| Thư mục | Vai trò |
|---|---|
| `routes/` | Định nghĩa endpoint (vd: lấy AQI theo trạm, theo khoảng thời gian, lấy kết quả dự báo). |
| `controllers/` | Xử lý logic nghiệp vụ cho từng route. |
| `models/` | Định nghĩa truy vấn/kết nối tới các bảng MySQL. |

### 3.4. `backend/ai-forecast/` — Nghiên cứu ứng dụng AI dự báo

Mang tính **nghiên cứu/thử nghiệm**, tách biệt khỏi `api/` chính, chưa cần tích hợp sâu ngay.

| Thư mục | Vai trò |
|---|---|
| `notebooks/` | Notebook thử nghiệm (Jupyter/Python) khám phá dữ liệu và thử các mô hình dự báo (ARIMA, Prophet, LSTM). |
| `models/` | Lưu mô hình đã huấn luyện (file trọng số) nếu có kết quả khả quan. |

### 3.5. `backend/config/`, `.env.example`, `package.json`

- `config/`: cấu hình kết nối MySQL, biến môi trường dùng chung cho toàn backend.
- `.env.example`: mẫu biến môi trường (API Key IQAir, thông tin kết nối DB) — **không** commit file `.env` thật.
- `package.json`: khai báo dependency (axios, dotenv, node-cron, mysql2, express...).

---

## 4. Chi tiết thư mục `frontend/`

Frontend là giao diện web hiển thị dashboard cho người dùng cuối, gọi dữ liệu qua API do `backend/api/` cung cấp (thay thế/khớp với phần Power BI hoặc Grafana nếu bạn muốn tự xây giao diện web riêng thay vì dùng công cụ BI có sẵn).

| Thư mục | Vai trò |
|---|---|
| `public/` | File tĩnh (favicon, index.html gốc, ảnh không qua build). |
| `src/assets/` | Hình ảnh, icon, font dùng trong giao diện. |
| `src/components/` | Các thành phần giao diện tái sử dụng (biểu đồ, thẻ hiển thị AQI, bảng dữ liệu...). |
| `src/pages/` | Các trang chính (Trang tổng quan, Trang chi tiết theo trạm, Trang dự báo). |
| `src/services/` | Module gọi API tới `backend/api/` (fetch dữ liệu AQI, thời tiết, dự báo). |
| `src/store/` | Quản lý state toàn cục của ứng dụng (nếu dùng Redux/Zustand/Context API...). |
| `.env.example` | Mẫu biến môi trường (đường dẫn tới backend API). |
| `package.json` | Khai báo dependency (React/Vue, thư viện biểu đồ như Chart.js/Recharts...). |

> Nếu bạn vẫn dùng Power BI/Grafana làm công cụ trực quan hóa chính (như trong đề cương Tuần 4) thay vì tự code giao diện, thì `frontend/` sẽ chỉ chứa file cấu hình kết nối/dashboard export (`.json`, `.pbix`) thay vì mã nguồn React/Vue. Cho tôi biết bạn chọn hướng nào để mình điều chỉnh chi tiết thư mục `frontend/` cho khớp.

---

## 5. Thư mục `docs/` (hỗ trợ, không thuộc code)

Nên tạo và cập nhật **ngay từ Tuần 1**, không để tới Tuần 5 mới làm.

| Thư mục | Vai trò |
|---|---|
| `architecture/` | Sơ đồ mô hình hoạt động và kiến trúc hệ thống IOC (Tuần 1-2), sơ đồ ERD cơ sở dữ liệu. |
| `screenshots/` | Ảnh chụp màn hình dashboard, kết quả demo qua từng giai đoạn. |
| `report/` | Bản nháp báo cáo thực tập, cập nhật dần theo từng tuần. |

---

## 6. Thứ tự triển khai đề xuất (bám theo lịch trình)

**Tuần 3:**
1. Thiết kế và tạo bảng trong `backend/database/schema/` trước tiên (mọi phần sau đều phụ thuộc cấu trúc bảng).
2. Đăng ký tài khoản IQAir, lấy API Key, cấu hình `.env` trong `backend/collector/`.
3. Viết chương trình gọi API trong `backend/collector/services/`, chạy thử để đổ dữ liệu vào MySQL.
4. Viết hàm làm sạch/chuẩn hóa trong `backend/collector/utils/` sau khi đã có dữ liệu thật trong DB.
5. Xây dựng `backend/api/` để cung cấp dữ liệu cho frontend.

**Tuần 4:**
1. Xây dựng `frontend/` (hoặc kết nối Power BI/Grafana) để hiển thị dữ liệu từ `backend/api/`.
2. Thiết kế dashboard, xây biểu đồ, viết nhận xét (lưu kết quả vào `docs/screenshots/`).
3. Kiểm thử và tối ưu toàn hệ thống thu thập → lưu trữ → hiển thị.
4. Bắt đầu thử nghiệm mô hình dự báo AI trong `backend/ai-forecast/notebooks/`.

**Tuần 5:**
1. Hoàn thiện `frontend/` (dashboard).
2. Gộp toàn bộ tài liệu trong `docs/` thành báo cáo thực tập hoàn chỉnh, nộp kết quả.

---

## 7. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Thu thập dữ liệu | Node.js, Axios |
| Lưu trữ | MySQL |
| Backend API | Node.js (Express hoặc tương đương) |
| Frontend | React/Vue (hoặc Power BI/Grafana nếu không tự code giao diện) |
| Dự báo AI | Python (thử nghiệm: ARIMA/Prophet/LSTM) |
| Nguồn dữ liệu | IQAir API |

---

## 8. Ghi chú

- Không commit API Key hoặc thông tin đăng nhập thật lên Git — luôn dùng file `.env.example` làm mẫu, ở cả `backend/` và `frontend/`.
- `backend/` và `frontend/` là 2 dự án Node.js độc lập, mỗi bên có `package.json`, `node_modules/`, và lệnh chạy riêng.
- Cập nhật `docs/` liên tục theo từng tuần để tránh dồn việc viết báo cáo vào Tuần 5.