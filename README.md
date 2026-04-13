# The Noders Community Website

Official website of The Noders Community - a full platform for showcasing AI products, publishing content, running educational programs and AI competitions, verifying certificates, and managing internal operations.

## Product Scope

This project is built as a full-stack system using Next.js App Router + Supabase, with two main layers:

- Public Platform: community-facing pages for products, posts, members, programs, competitions, and certificate verification.
- Internal Management: authenticated dashboards and admin tools for managing users, content, products, certificates, and analytics.

## Public Features

### 1. Homepage
- Community introduction and brand positioning.
- KPI highlights (members, products, contests, posts, views).
- Featured sections for programs, recent products, and community activities.
- SEO metadata, JSON-LD structured data, robots, and sitemap integration.

### 2. Products
- Product listing with thumbnails, tech stack, status, and contributor context.
- Product detail pages for deeper project information.
- Visibility into team participation and contribution-related metadata.

### 3. Posts / Knowledge Hub
- Multi-category content system: News, Community Activities, Tech Sharing, Member Spotlight, Do You Know.
- Search, filtering, sorting, and pagination.
- Block-based post content (text, quote, image, YouTube).
- Post detail with related posts, views, upvotes, and author info.

### 4. Members
- Member directory with core team visibility.
- Search and role-based filtering.
- Profile-centric display of skills, role, and relevant community info.

### 5. Education
- DS/AI mini-course presentation pages.
- Program details: audience, schedule, partner, and curriculum summary.

### 6. Contest
- AI competition hub for internal and public contests.
- Contest descriptions, participant stats, timelines, and media/video highlights.

### 7. Certificate Verification
- Public certificate verification by certificate ID.
- Validity check and certificate holder details display.

### 8. Supporting Pages
- Contact, Terms, Privacy, Not Found, Error, Loading.
- Multilingual support in selected user-facing modules.

## Internal Features (Authenticated)

### 1. Authentication & Authorization
- Session-based login via Supabase Auth.
- Role-based access control (member/admin).
- Protected routes for dashboard and admin areas.

### 2. User Dashboard
- Personal post management by status (draft/published/archived).
- Create, edit, and delete post flows.
- Basic post analytics visibility (views/upvotes/time).

### 3. Admin Dashboard
- System-wide metrics overview: members, projects, posts, views, upvotes.
- Quick access to all admin modules.

### 4. Admin User Management
- User/auth profile listing.
- Role and profile management with admin permissions.

### 5. Admin Posts Management
- Centralized moderation and management for all posts.
- Publication workflow control.

### 6. Admin Products Management
- Create, edit, and delete products.
- Contributor, thumbnail, and metadata management.

### 7. Admin Certificates Management
- Certificate management workflows.
- Utility APIs for generation and verification support.

## Media & Upload System

- Token-authenticated image uploads.
- Image processing with Sharp by usage profile (avatar, project thumbnail, news image, certificate, general).
- File size/type validation and Supabase Storage + DB metadata integration.

## API Capability Summary

API routes are organized with Next.js App Router handlers across these groups:

- Public Data APIs: posts, products, members, stats, certificate verification.
- Authenticated APIs: post CRUD, post blocks CRUD, upvote, dashboard operations.
- Admin APIs: users, stats, posts/products management, certificate utilities.
- Upload APIs: image processing and storage integration.

Backend data access is controlled through Supabase and RLS policies in `supabase/migrations`.

## Architecture Snapshot

- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS.
- Data/Auth/Storage: Supabase (PostgreSQL, Auth, Storage, RLS).
- UI Layer: reusable design system components.
- Content Rendering: modular block-based post content with media embedding.

## Directory Overview

```text
src/
	app/           # routes, pages, API handlers
	components/    # reusable UI + feature components
	lib/           # auth, queries, constants, hooks, utilities
	types/         # TypeScript models
supabase/
	migrations/    # schema changes + RLS policies
docs/
	*.md           # project docs and notes
```

---

# Website The Noders Community

Website chính thức của The Noders Community - nền tảng tổng hợp để trưng bày sản phẩm AI, xuất bản nội dung, tổ chức chương trình học và kỳ thi AI, xác minh chứng chỉ, và quản trị vận hành nội bộ.

## Phạm Vi Sản Phẩm

Dự án được xây dựng theo mô hình full-stack với Next.js App Router + Supabase, gồm 2 lớp chính:

- Nền tảng công khai: các trang dành cho cộng đồng như sản phẩm, bài viết, thành viên, chương trình, cuộc thi và xác minh chứng chỉ.
- Hệ thống nội bộ: dashboard đăng nhập và công cụ admin để quản lý người dùng, nội dung, sản phẩm, chứng chỉ và thống kê.

## Chức Năng Public

### 1. Trang chủ
- Giới thiệu cộng đồng và định vị thương hiệu.
- Hiển thị KPI hoạt động (thành viên, sản phẩm, cuộc thi, bài viết, lượt xem).
- Nổi bật các mục chương trình, sản phẩm mới và hoạt động cộng đồng.
- Tích hợp SEO metadata, JSON-LD structured data, robots và sitemap.

### 2. Sản phẩm
- Danh sách sản phẩm với thumbnail, tech stack, trạng thái và thông tin đội ngũ tham gia.
- Trang chi tiết sản phẩm để xem đầy đủ nội dung.
- Hiển thị ngữ cảnh đóng góp của thành viên.

### 3. Bài viết / Knowledge Hub
- Hệ thống bài viết theo nhiều chuyên mục: News, Community Activities, Tech Sharing, Member Spotlight, Do You Know.
- Tìm kiếm, lọc, sắp xếp và phân trang.
- Nội dung bài viết dạng block (text, quote, image, YouTube).
- Trang chi tiết có bài liên quan, lượt xem, lượt upvote và thông tin tác giả.

### 4. Thành viên
- Danh bạ thành viên và nhóm nòng cốt.
- Tìm kiếm và lọc theo vai trò.
- Hiển thị hồ sơ, kỹ năng, vai trò và thông tin liên quan.

### 5. Education
- Trang giới thiệu mini-course DS/AI.
- Thông tin chương trình gồm đối tượng, lịch học, đối tác và tóm tắt nội dung.

### 6. Contest
- Trung tâm tổng hợp các kỳ thi AI nội bộ và công khai.
- Hiển thị mô tả, thống kê tham gia, mốc thời gian và media/video tổng kết.

### 7. Xác minh chứng chỉ
- Xác minh chứng chỉ công khai bằng certificate ID.
- Kiểm tra tính hợp lệ và hiển thị thông tin người sở hữu.

### 8. Trang bổ trợ
- Contact, Terms, Privacy, Not Found, Error, Loading.
- Hỗ trợ đa ngôn ngữ cho các phần nội dung cần thiết.

## Chức Năng Nội Bộ (Authenticated)

### 1. Xác thực & phân quyền
- Đăng nhập và quản lý session qua Supabase Auth.
- Phân quyền theo vai trò (member/admin).
- Bảo vệ route cho dashboard và khu vực admin.

### 2. User Dashboard
- Quản lý bài viết cá nhân theo trạng thái (draft/published/archived).
- Luồng tạo, sửa, xóa bài viết.
- Theo dõi chỉ số cơ bản của bài viết (views/upvotes/time).

### 3. Admin Dashboard
- Tổng quan thống kê toàn hệ thống: members, projects, posts, views, upvotes.
- Truy cập nhanh đến các module quản trị.

### 4. Admin quản lý người dùng
- Danh sách user và auth profile.
- Quản lý vai trò/thông tin theo quyền admin.

### 5. Admin quản lý bài viết
- Quản trị tập trung toàn bộ bài viết.
- Kiểm soát quy trình xuất bản.

### 6. Admin quản lý sản phẩm
- Tạo, sửa, xóa sản phẩm.
- Quản lý contributor, thumbnail và metadata.

### 7. Admin quản lý chứng chỉ
- Quản trị vòng đời chứng chỉ.
- Utility APIs hỗ trợ tạo mã và xác minh.

## Hệ Thống Upload & Media

- Upload ảnh có xác thực token.
- Xử lý ảnh bằng Sharp theo từng mục đích (avatar, project thumbnail, news image, certificate, general).
- Kiểm tra dung lượng/định dạng và tích hợp Supabase Storage + metadata trong database.

## Tóm Tắt Năng Lực API

Các API route được tổ chức theo App Router route handlers, gồm các nhóm chính:

- Public Data APIs: posts, products, members, stats, certificate verification.
- Authenticated APIs: post CRUD, post blocks CRUD, upvote, dashboard operations.
- Admin APIs: users, stats, posts/products management, certificate utilities.
- Upload APIs: xử lý ảnh và tích hợp lưu trữ.

Toàn bộ dữ liệu backend được kiểm soát bởi Supabase và RLS policies trong thư mục `supabase/migrations`.

## Tóm Tắt Kiến Trúc

- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS.
- Data/Auth/Storage: Supabase (PostgreSQL, Auth, Storage, RLS).
- UI Layer: bộ component tái sử dụng theo design system.
- Content Rendering: kiến trúc bài viết dạng block và media embedding.

## Cấu Trúc Thư Mục

```text
src/
	app/           # routes, pages, API handlers
	components/    # reusable UI + feature components
	lib/           # auth, queries, constants, hooks, utilities
	types/         # TypeScript models
supabase/
	migrations/    # schema changes + RLS policies
docs/
	*.md           # project docs and notes
```