export interface AuditLog {
    _id: string;
    user?: {
      _id?: string;
      fullName?: string;
      username?: string;
      role?: string;
    } | string;
    action: string;
    entity: string;
    entityId?: string;
    description?: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    createdAt?: string;
    updatedAt?: string;
  }