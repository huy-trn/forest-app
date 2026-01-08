# Nhiệm vụ đồ án tốt nghiệp

Xây dựng hệ thống web quản lý dự án rừng với các yêu cầu chính:
- Quản lý dự án trồng rừng, phân loại rừng tự nhiên/rừng trồng, theo dõi tiến độ và vị trí trên bản đồ.
- Hỗ trợ đa vai trò: admin, partner (đội hiện trường) và investor, với quyền truy cập và thao tác riêng.
- Quản lý ticket/công việc, log/bình luận/đính kèm và thông báo cập nhật.
- Geocoding an toàn (qua proxy, yêu cầu đăng nhập), bản đồ vị trí và lịch sử thay đổi.
- Trang giới thiệu công khai (showcase) với dự án nổi bật và bài viết, đa ngôn ngữ (EN/VI).
- Hạ tầng container hóa, CI/CD triển khai lên EC2, reverse proxy + TLS tự động (nginx + Certbot).

## Tóm tắt
Đồ án xây dựng một nền tảng quản lý dự án rừng đa vai trò, đáp ứng đồng thời nhu cầu vận hành tại hiện trường và minh bạch thông tin cho nhà đầu tư. Hệ thống cho phép tạo và theo dõi dự án (rừng tự nhiên/rừng trồng), quản lý công việc/ticket, ghi nhận vị trí trên bản đồ, và cung cấp trang showcase công khai đa ngôn ngữ. Geocoding được triển khai an toàn trên hạ tầng nội bộ, có kênh dự phòng khi cần. Việc triển khai hướng tới tự động hóa và an toàn (reverse proxy, TLS), hỗ trợ mở rộng trên hạ tầng đám mây. Dữ liệu khởi tạo mang tính thực tế, phục vụ thử nghiệm và trình diễn; phân quyền chặt chẽ để bảo vệ thông tin nội bộ.

## Mở đầu
Trong bối cảnh chuyển đổi số diễn ra mạnh mẽ, quản lý và giám sát các dự án trồng rừng đang trở thành nhu cầu cấp thiết để đảm bảo minh bạch, hiệu quả và bền vững. Những chương trình trồng rừng quy mô lớn thường phân tán theo địa lý, liên quan nhiều bên tham gia (quản trị, đội hiện trường, nhà đầu tư), đòi hỏi một nền tảng số vừa hỗ trợ vận hành tại hiện trường, vừa cung cấp số liệu đáng tin cậy cho nhà đầu tư và cơ quan quản lý. Bên cạnh đó, yêu cầu về trải nghiệm người dùng, khả năng định vị, và báo cáo tiến độ theo thời gian thực ngày càng cao.

Sự phát triển của các công nghệ web hiện đại và dịch vụ bản đồ mở như Nominatim tạo cơ hội để xây dựng một hệ thống kết nối các bên, giảm thiểu thao tác thủ công và nâng cao tính minh bạch. Hệ thống cần bảo vệ dữ liệu nội bộ (địa điểm, nhật ký công việc), đồng thời cung cấp một kênh giới thiệu công khai để thu hút nguồn lực và niềm tin từ nhà đầu tư.

Đồ án “Hệ thống quản lý dự án rừng” được lựa chọn để giải quyết các vấn đề trên. Mục tiêu là xây dựng một nền tảng hợp nhất: quản lý dự án (rừng tự nhiên/rừng trồng), ticket công việc, bản đồ vị trí và geocoding an toàn, cùng trang showcase đa ngôn ngữ. Hệ thống hướng tới hai giá trị: (1) hỗ trợ vận hành thực địa hiệu quả (ghi nhận vị trí, nhật ký, đính kèm), (2) cung cấp thông tin minh bạch, cập nhật cho nhà đầu tư và công chúng.

Phạm vi tập trung vào môi trường trực tuyến, phục vụ các bên liên quan trong lĩnh vực lâm nghiệp bền vững. Thông qua phân tích, thiết kế, triển khai và kiểm thử, đồ án kỳ vọng mang lại một giải pháp thực tiễn, dễ triển khai trên hạ tầng đám mây (EC2), góp phần nâng cao hiệu quả quản lý và thu hút đầu tư cho các dự án trồng rừng.

## Kiến trúc & công nghệ
- Next.js (App Router) cho frontend + backend API, TypeScript, UI Tailwind/shadcn.
- Prisma + PostgreSQL cho dữ liệu; seed khởi tạo người dùng, dự án, ticket, showcase (EN/VI).
- Geocoding: Nominatim tự host, không mở port; API `/api/geocode` proxy nội bộ, bắt buộc đăng nhập, fallback OSM khi lỗi.
- Triển khai: Docker Compose (dev/prod), nginx reverse proxy, Certbot cấp TLS, ảnh build/push lên GHCR, chạy trên EC2.
- CI/CD: GitHub Actions (`deploy-ec2.yml`) lọc thay đổi, build/push, upload compose/nginx/certbot, SSH deploy, đảm bảo Docker/Compose (Amazon Linux hoặc script), kéo image (fallback `latest`), `docker compose up -d`.

## Chức năng chính
- Quản lý dự án: tạo/sửa, forestType (tự nhiên/nhân tạo), trạng thái, thành viên, mô tả rich text.
- Quản lý ticket: log, bình luận, đính kèm, SSE thông báo, phân quyền theo vai trò.
- Bản đồ: ghim vị trí dự án, xem lịch sử thay đổi, panel chọn dự án; geocode an toàn qua proxy.
- Showcase công khai: dự án nổi bật, bài viết, đa ngôn ngữ; hình ảnh lấy từ nội dung mô tả.
- Đa ngôn ngữ: tiếng Anh/Việt cho toàn bộ giao diện và dữ liệu seed.

## Quy trình triển khai
- Build & push image lên GHCR (khi code app thay đổi).
- Deploy: upload `docker-compose.yml`, `docker-compose.prod.yml`, cấu hình nginx/certbot; SSH vào EC2, cài Docker/Compose nếu thiếu, login GHCR, pull image (fallback `latest`), `docker compose -f ... up -d`.
- Timeout mở rộng (job 180 phút, SSH 10.800s) để Nominatim import lần đầu không làm fail CI.
- Secrets cần: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, `GHCR_USERNAME`, `GHCR_READ_TOKEN/GHCR_TOKEN`, `DOMAIN_NAME` (hoặc `EC2_HOST`), `CERTBOT_EMAIL`.

## Bảo mật & phân quyền
- Xác thực: API dùng `getUserFromRequest`; geocode và các API nội bộ trả 401 nếu chưa đăng nhập.
- Nominatim không mở cổng public; chỉ truy cập qua proxy API đã auth.
- TLS tự động với Certbot + nginx; header proxy chuyển tiếp đúng thông tin gốc.
- Vai trò: admin/partner/investor với dữ liệu filter theo quyền (project list, ticket).

## Vận hành & hiệu năng
- Nominatim: import lần đầu lâu (1–3 giờ với 2 vCPU/8GB, PBF Việt Nam ~300MB); volumes giữ dữ liệu, lần sau khởi động nhanh. Có thể thêm swap/nâng instance nếu OOM.
- Giám sát: `docker logs -f <nominatim>` cho import, `free -h`, `docker stats` kiểm tra tài nguyên.
- Web service khởi động chạy `prisma migrate deploy` + `prisma db seed` (tắt nếu không cần seed ở prod).

## Rủi ro & giảm thiểu
- Import Nominatim quá lâu/timeout CI: đã tăng timeout, giữ volume, có thể chạy import thủ công trước.
- GHCR pull lỗi: fallback `latest`.
- TLS phụ thuộc DNS đúng; nếu dùng `EC2_HOST` không có Elastic IP, stop/start có thể đổi hostname/IP.
- Tài nguyên EC2 hạn chế: thêm swap hoặc nâng instance khi cần.

## Hướng phát triển
- Thêm health/metrics cho web và Nominatim.
- Rate limiting/API key cho geocode khi mở rộng tải.
- Script tự động tạo swap hoặc kiểm tra cấu hình máy trước deploy.
- Test tích hợp cho phân quyền, map và geocode; bổ sung monitoring/alert.
