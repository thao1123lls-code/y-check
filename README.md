# Y-Check — Dừng, Soi, Hỏi trước khi chia sẻ thông tin sức khỏe

> **Dự án dự thi Cuộc thi “1.000 ý tưởng chăm sóc sức khỏe Việt” năm 2026**  
> Nhóm nội dung: *Truyền thông, giáo dục sức khỏe*

**Y-Check** là ứng dụng web mã nguồn mở giúp sinh viên và gia đình tự kiểm chứng độ tin cậy của một thông tin sức khỏe trên mạng xã hội (TikTok, Facebook, Zalo) chỉ trong **30 giây** theo quy tắc 3 bước **Dừng – Soi – Hỏi**, kết hợp mô hình 3D tương tác và trợ lý AI định hướng kiểm chứng.

---

## Tính năng nổi bật

### 1. Công cụ Soi tin 30 giây & Tự động bắt từ khóa cảnh báo
- **Dùng thử 1 chạm trong 10 giây:** Tích hợp sẵn 3 tin đồn mẫu (*Nước chanh muối chữa cảm*, *Detox thải độc 3 ngày*, *Rửa tay xà phòng theo WHO*) tương ứng 3 mức đèn tín hiệu **Đỏ – Vàng – Xanh**.
- **Bước Dừng thông minh:** Khi người dùng dán nội dung tin từ Zalo/Facebook, hệ thống tự động quét và tô đỏ các cụm từ có dấu hiệu giật gân, hứa “chữa khỏi hoàn toàn” hoặc kêu gọi mua hàng.
- **Bước Soi (4 câu hỏi cốt lõi):** Chấm điểm theo khung *SIFT / CRAAP* điều chỉnh cho bối cảnh y tế Việt Nam (*Ai nói? Bằng chứng nào? Khi nào? Nơi khác có nói vậy không?*).

### 2. Mô hình 3D tương tác (Three.js)
- Thiết kế mô hình đèn tín hiệu công nghiệp kết hợp kính lúp quang học sử dụng vật liệu vật lý (`MeshPhysicalMaterial`, *Studio Environment Map*, vân thấu kính Fresnel).
- Hỗ trợ **kéo chuột/chạm để xoay 3D** trực tiếp và **đồng bộ thời gian thực** màu đèn với kết quả chấm điểm của công cụ Soi tin.

### 3. Tối ưu cho mô hình “Sinh viên dạy người thân”
- **Tạo tin nhắn gửi nhóm Zalo gia đình:** Tự động soạn sẵn đoạn giải thích lịch sự, dễ hiểu kèm điểm kiểm chứng để sao chép 1 chạm và gửi cho bố mẹ, ông bà.
- **Chế độ Chữ to · Dễ đọc:** Công tắc chuyển nhanh cỡ chữ lớn và độ tương phản cao dành cho người lớn tuổi (tự động lưu tùy chọn trên trình duyệt).
- **Xuất ảnh kết quả & Thẻ 4 câu hỏi:** Tải ảnh PNG (1080×1350) hoặc in/lưu bản PDF Thẻ bỏ túi 4 câu hỏi để sử dụng trong workshop sinh viên.

### 4. Minh bạch & An toàn chuyên môn
- **Tem kiểm duyệt chuyên môn** trên từng hồ sơ tin đồn (hiển thị người biên soạn, người duyệt, ngày cập nhật và nguồn đối chiếu Bộ Y tế, WHO).
- **Cơ chế Báo cáo sai sót (xử lý trong 24 giờ):** Tích hợp hộp thoại phản ánh kết nối API backend `POST /api/report`.
- **Trợ lý Y-Check Bot:** Hỗ trợ phân tích tin theo quy tắc 3 bước với giới hạn an toàn y khoa chặt chẽ ở phía server (*không chẩn đoán, không kê đơn, luôn khuyến nghị gọi 115 khi có dấu hiệu nguy hiểm*).

---

## Công nghệ sử dụng

| Thành phần | Công nghệ |
| :--- | :--- |
| **Backend** | Node.js (`>= 20.6`), Express (`^4.21.2`) |
| **AI Assistant** | Anthropic SDK (`@anthropic-ai/sdk`) |
| **Frontend** | HTML5, CSS3 (Responsive & Print CSS), Vanilla JavaScript |
| **Đồ họa 3D** | Three.js (`r128`) |

---

## Cấu trúc thư mục

```text
y-check/
├── server.js               # Máy chủ Express, API /api/chat, /api/report, rate-limit
├── package.json            # Cấu hình dự án & thư viện phụ thuộc
├── .env.example            # Mẫu biến môi trường (ANTHROPIC_API_KEY, PORT)
├── .gitignore
├── README.md
└── public/
    ├── index.html          # Giao diện chính & hệ sinh thái 4 hợp phần
    ├── style.css           # Hệ thống giao diện, chế độ Chữ to & định dạng in PDF
    └── js/
        ├── main.js         # Công cụ Soi tin, quét từ khóa, tin nhắn Zalo, xuất PNG, Modal 24h
        ├── scene.js        # Mô hình 3D đèn tín hiệu & kính lúp quang học (Three.js)
        ├── quiz.js         # Bài luyện tập nhận diện tin giả & chia sẻ liên kết
        └── chatbot.js      # Giao diện trò chuyện kết nối Y-Check Bot
```

---

## Hướng dẫn cài đặt & chạy cục bộ

### Yêu cầu
- [Node.js](https://nodejs.org/) phiên bản **20.6** trở lên.

### Các bước thực hiện

```bash
# 1. Clone repository
git clone [https://github.com/thao1123lls-code/y-check.git](https://github.com/thao1123lls-code/y-check.git)
cd y-check

# 2. Cài đặt thư viện
npm install

# 3. Tạo file biến môi trường (tùy chọn cho Y-Check Bot)
cp .env.example .env
# Mở file .env và điền ANTHROPIC_API_KEY của bạn

# 4. Chạy ở chế độ phát triển (tự động tải lại khi sửa code)
npm run dev

# Hoặc chạy ở chế độ sản phẩm
npm start
```

Sau khi khởi chạy, mở trình duyệt tại: `http://localhost:3000`

> **Lưu ý:** Nếu chưa cấu hình `ANTHROPIC_API_KEY`, toàn bộ website (công cụ Soi tin, mô hình 3D, quét từ khóa, tin nhắn Zalo, tải Thẻ 4 câu hỏi, Quiz và Báo cáo sai sót) vẫn hoạt động bình thường; riêng khung chat Y-Check Bot sẽ hiển thị thông báo chưa cấu hình AI.

---

## Danh sách API

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/healthz` | Kiểm tra trạng thái máy chủ, cấu hình AI và số lượng báo cáo |
| `POST` | `/api/chat` | Gửi hội thoại tới Y-Check Bot (có kiểm tra đầu vào & giới hạn 20 req/10 phút/IP) |
| `POST` | `/api/report` | Tiếp nhận báo cáo sai sót chuyên môn để rà soát trong 24 giờ |

---

## Miễn trừ trách nhiệm y khoa

Y-Check là công cụ giáo dục nhằm rèn luyện kỹ năng chọn lọc thông tin sức khỏe (**không chẩn đoán bệnh, không kê đơn, không tư vấn liều thuốc**). Mọi nội dung chỉ mang tính tham khảo và không thay thế cho thăm khám hoặc tư vấn trực tiếp của bác sĩ, dược sĩ. Khi có triệu chứng bất thường, hãy đến cơ sở y tế; nếu có dấu hiệu nguy hiểm, hãy gọi cấp cứu **115**.

---

## Tác giả & Giấy phép

- **Tác giả:** Hoàng Phương Thảo — Sinh viên ngành Kỹ thuật phần mềm, Trường Đại học Công nghệ Đồng Nai.
- **Email:** thao1.123lls@gmail.com
- **Giấy phép:** Phát hành dưới giấy phép [MIT](LICENSE) — khuyến khích các trường đại học, câu lạc bộ sinh viên và cộng đồng sử dụng lại cho mục đích giáo dục sức khỏe phi lợi nhuận.