# Ý tưởng Website Câu lạc bộ AI Agent Workshop

## Tổng quan dự án
Tạo một website portfolio cho câu lạc bộ được hình thành từ workshop về AI agent, nhằm mục đích lưu trữ và trình bày các sản phẩm, dự án mà nhóm đã thực hiện.

## Cấu trúc website

### 1. Trang chủ - Giới thiệu tổng quát
- **Mục đích**: Giới thiệu về câu lạc bộ, thành viên và lý do thành lập
- **Nội dung**:
  - Banner chào mừng với logo/tên câu lạc bộ
  - Câu chuyện về workshop AI agent ban đầu
  - Tầm nhìn và mục tiêu của câu lạc bộ
  - Danh sách thành viên cốt cán
  - Thống kê tổng quan (số dự án, số thành viên, etc.)

### 2. Thư viện dự án (Project Library)
- **Mục đích**: Hiển thị tất cả các dự án của câu lạc bộ
- **Layout**: Dạng grid/card layout cho dễ duyệt
- **Thông tin mỗi dự án**:
  - Hình ảnh thumbnail
  - Tên dự án
  - Mô tả ngắn (1-2 câu)
  - Biểu đồ contribution (pie chart/bar chart) hiển thị % đóng góp của từng thành viên
  - Tags công nghệ sử dụng
  - Ngày hoàn thành

### 3. Chi tiết dự án
- **Truy cập**: Click vào dự án từ thư viện
- **Nội dung chi tiết**:
  - **Video demo**: Embedded video showcasing dự án
  - **Giới thiệu dự án**: Mục đích, target audience
  - **Quá trình phát triển ý tưởng**: Story behind the project
  - **Công nghệ sử dụng**: Tech stack, frameworks, tools
  - **Challenges & Solutions**: Khó khăn gặp phải và cách giải quyết
  - **Link repository**: GitHub/GitLab links
  - **Team members**: Chi tiết contribution của từng người
  - **Screenshots/Gallery**: Hình ảnh minh họa thêm

### 4. Trang cá nhân thành viên
- **Mục đích**: Cho phép mỗi thành viên tự giới thiệu
- **Nội dung**:
  - Ảnh profile
  - Bio/Giới thiệu cá nhân
  - Kỹ năng chuyên môn
  - Vai trò trong câu lạc bộ
  - Dự án đã tham gia
  - Liên hệ cá nhân (social media, email)
  - Achievements/Certifications

## Tính năng bổ sung

### 5. Blog/News section
- Cập nhật hoạt động mới của câu lạc bộ
- Chia sẻ kiến thức, tutorials
- Thông báo về workshops, events sắp tới

### 6. Contact & Join us
- Form liên hệ
- Thông tin tuyển thành viên mới
- Lịch họp/hoạt động

## Công nghệ đề xuất
- **Frontend**: React/Next.js hoặc Vue.js
- **Styling**: Tailwind CSS
- **Backend**: Node.js/Express hoặc Python/FastAPI
- **Database**: MongoDB hoặc PostgreSQL
- **Hosting**: Vercel, Netlify hoặc AWS
- **Version Control**: Git contribution analysis cho charts

## Thiết kế UI/UX
- **Theme**: Modern, clean, tech-focused
- **Color scheme**: Phù hợp với AI/tech theme
- **Responsive**: Mobile-first design
- **Animation**: Subtle transitions và hover effects
- **Loading**: Skeleton loading cho better UX