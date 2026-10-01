# Hệ thống Quản lý Hồ sơ Vay vốn (Loan Origination & Management System)

Dự án mô phỏng hệ thống quản lý quy trình cho vay tại ngân hàng / tổ chức tài chính: từ tiếp nhận khách hàng, tạo hồ sơ vay, phê duyệt (maker–checker), giải ngân, theo dõi khoản vay đến ghi nhận trả nợ và nhật ký kiểm toán.

Mục tiêu: thể hiện năng lực phát triển full-stack, hiểu nghiệp vụ tín dụng cơ bản, phân quyền và audit trail — phù hợp vị trí **Fresher / Junior Software Developer** trong lĩnh vực ngân hàng.

---

## Tính năng chính

- **Quản lý khách hàng**: tạo, xem, cập nhật thông tin khách hàng
- **Hồ sơ vay (Loan Application)**
  - Tạo hồ sơ (DRAFT)
  - Gửi phê duyệt (SUBMIT → PENDING)
  - Phê duyệt / Từ chối / Yêu cầu bổ sung
  - Giải ngân (DISBURSE) → tự động tạo khoản vay + lịch trả nợ
- **Phân quyền theo vai trò (RBAC)**
  - CREDIT_OFFICER, APPROVER, MANAGER, ADMIN
  - Ẩn/hiện menu & nút theo quyền
  - Bảo vệ route bằng Auth Guard + Role Guard
- **Khoản vay (Loan)**: theo dõi dư nợ, trạng thái ACTIVE / OVERDUE / COMPLETED
- **Lịch trả nợ (Repayment)**
  - Xem lịch theo khoản vay
  - Danh sách kỳ quá hạn
  - Ghi nhận thanh toán **bắt buộc theo thứ tự kỳ**
- **Audit Logs**: ghi nhận các hành động quan trọng (tạo KH, tạo/gửi/duyệt/giải ngân hồ sơ, thanh toán…)
- **Dashboard**: thống kê tổng quan phục vụ quản lý

---

## Tech Stack

| Tầng | Công nghệ |
|------|-----------|
| Backend | NestJS, MongoDB (Mongoose), JWT (Access + Refresh Token), class-validator |
| Frontend | Angular (Standalone Components), Angular Material, RxJS, Signals |
| Khác | Role-based Access Control, Audit Logging |

---

## Vai trò & phân quyền

| Role | Quyền chính |
|------|-------------|
| **CREDIT_OFFICER** | Tạo khách hàng, tạo/gửi hồ sơ vay, xem khoản vay, ghi nhận thanh toán |
| **APPROVER** | Phê duyệt hồ sơ (bước trung gian) |
| **MANAGER** | Phê duyệt cuối, giải ngân, xem Audit Logs, hầu hết thao tác nghiệp vụ |
| **ADMIN** | Toàn quyền |

Luồng phê duyệt hướng tới mô hình **maker – checker**: người tạo hồ sơ và người duyệt được tách role.

---

## Luồng nghiệp vụ chính

```text
Tạo khách hàng
    → Tạo hồ sơ vay (DRAFT)
    → Gửi hồ sơ (PENDING)
    → Approver duyệt (REVIEWING)
    → Manager/Admin duyệt (APPROVED)
    → Giải ngân (DISBURSED)
         → Tạo Loan + Lịch trả nợ
    → Thanh toán từng kỳ (theo thứ tự)
    → Hoàn thành khoản vay (COMPLETED)