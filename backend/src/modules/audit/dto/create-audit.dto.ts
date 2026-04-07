export class CreateAuditDto {
  userId?: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  before?: any;
  after?: any;
  ipAddress?: string;
}
