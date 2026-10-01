import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { AuditLogService } from '../../../core/services/audit-log.service';
import { AuditLog } from '../../../core/models/audit-log.model';

@Component({
  selector: 'app-audit-log-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
  ],
  templateUrl: './audit-log-list.component.html',
  styleUrl: './audit-log-list.component.scss',
})
export class AuditLogListComponent implements OnInit {
  loading = signal(true);
  errorMessage = signal('');
  logs = signal<AuditLog[]>([]);
  filteredLogs = signal<AuditLog[]>([]);

  // Filter
  searchText = '';
  actionFilter = 'ALL';
 
  //danh sách các cột hiển thị
  displayedColumns = [
    'createdAt',
    'user',
    'action',
    'entity',
    'description',
    'ipAddress',
  ];

  // Danh sách action phổ biến (có thể mở rộng)
  actionOptions = [
    'ALL',
    'CREATE_LOAN_APPLICATION',
    'CREATE_LOAN',
    'SUBMIT',
    'APPROVE',
    'REJECT',
    'REQUEST_MORE_INFO',
    'DISBURSE',
    'MARK_AS_PAID',
    'UPDATE',
    'DELETE',
    'LOGIN',
    'LOGOUT',
  ];

  constructor(private auditLogService: AuditLogService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.errorMessage.set('');

    this.auditLogService.getAll().subscribe({
      next: (res) => {
        this.logs.set(res);
        this.applyFilter();
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Không tải được nhật ký hoạt động',
        );
      },
    });
  }

  applyFilter() {
    let result = this.logs(); //this.logs() là danh sách Audit Log ban đầu.

    // Lọc theo action
    if (this.actionFilter !== 'ALL') { // !all mới thực hiện lọc
      result = result.filter(
        (log) => //log: đại diện cho từng auditlog trong danh sách
          log.action?.toUpperCase() === this.actionFilter.toUpperCase(), //chữ in hoa hay thường đều áp dụng đc
      );
    }

    // Lọc theo text (user, entity, description, action)
    const keyword = this.searchText.trim().toLowerCase(); //trim: xóa khoảng trắng đầu và cuối; 
    if (keyword) {                                        // toLowerCase: chuyển thành chữ thường
      result = result.filter((log) => { //lấy từng log để kiểm tra
        const userName = //lấy tên người dùng
          typeof log.user === 'object'
            ? `${log.user?.fullName || ''} ${log.user?.username || ''}`
            : '';
        const text = [
          userName,
          log.action,
          log.entity,
          log.entityId,
          log.description,
          log.ipAddress,
        ]
          .join(' ') //gom lại
          .toLowerCase();
        return text.includes(keyword); //kiểm tra chuỗi có chứa từ khóa không
      });
    }

    this.filteredLogs.set(result); //lưu result vào filteredLog để lọc
  }

  onFilterChange() { //khi ng dùng thay đổi bộ lọc thì lọc lại danh sách
    this.applyFilter();
  }

  formatDate(date?: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleString('vi-VN');
  }

  getUserDisplay(log: AuditLog): string { //lấy tên người dùng
    if (!log.user) return '—';
    if (typeof log.user === 'string') return log.user; //log.user: string nếu user là 1 chuỗi
    return ( //nếu user là object (id, fullname, username) thì ..
      log.user.fullName ||
      log.user.username ||
      log.user._id ||
      '—'
    );
  }

  getUserRole(log: AuditLog): string {
    if (!log.user || typeof log.user === 'string') return ''; //typeof: kiểm tra toán tử
    return log.user.role || '';
  }

  getActionLabel(action: string): string {
    if (!action) return '—';
  
    const map: Record<string, string> = {
      // Hồ sơ vay
      CREATE_LOAN_APPLICATION: 'Tạo hồ sơ vay',
      CREATE_LOAN: 'Tạo khoản vay',
      SUBMIT: 'Gửi hồ sơ',
      APPROVE: 'Phê duyệt',
      REJECT: 'Từ chối',
      REQUEST_MORE_INFO: 'Yêu cầu bổ sung',
      DISBURSE: 'Giải ngân',
  
      // Trả nợ
      MARK_AS_PAID: 'Ghi nhận thanh toán',
      PAY: 'Thanh toán',
  
      // Khách hàng / chung
      CREATE: 'Tạo mới',
      UPDATE: 'Cập nhật',
      DELETE: 'Xóa',
      LOGIN: 'Đăng nhập',
      LOGOUT: 'Đăng xuất',
    };
  
    return map[action.toUpperCase()] || action;
  }
}