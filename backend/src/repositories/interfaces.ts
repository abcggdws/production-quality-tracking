import { User, ProductionOrder, QualityRecord, Defect, ReworkOrder, Alert, AuthToken } from '../models/index.js';

export interface UserRepository {
  findAll(): User[];
  findById(id: string): User | undefined;
  findByEmail(email: string): User | undefined;
  findByUsername(username: string): User | undefined;
  findByRole(role: string): User[];
  create(user: User): User;
  update(id: string, user: Partial<User>): User | undefined;
  delete(id: string): boolean;
}

export interface ProductionOrderRepository {
  findAll(): ProductionOrder[];
  findById(id: string): ProductionOrder | undefined;
  findByOrderNumber(orderNumber: string): ProductionOrder | undefined;
  findByStatus(status: string): ProductionOrder[];
  findByOperatorId(operatorId: string): ProductionOrder[];
  create(order: ProductionOrder): ProductionOrder;
  update(id: string, order: Partial<ProductionOrder>): ProductionOrder | undefined;
  delete(id: string): boolean;
}

export interface QualityRecordRepository {
  findAll(): QualityRecord[];
  findById(id: string): QualityRecord | undefined;
  findByOrderId(orderId: string): QualityRecord[];
  findByInspectorId(inspectorId: string): QualityRecord[];
  findByResult(result: string): QualityRecord[];
  create(record: QualityRecord): QualityRecord;
  update(id: string, record: Partial<QualityRecord>): QualityRecord | undefined;
  delete(id: string): boolean;
}

export interface DefectRepository {
  findAll(): Defect[];
  findById(id: string): Defect | undefined;
  findByOrderId(orderId: string): Defect[];
  findByStatus(status: string): Defect[];
  findBySeverity(severity: string): Defect[];
  create(defect: Defect): Defect;
  update(id: string, defect: Partial<Defect>): Defect | undefined;
  delete(id: string): boolean;
}

export interface ReworkOrderRepository {
  findAll(): ReworkOrder[];
  findById(id: string): ReworkOrder | undefined;
  findByOrderId(orderId: string): ReworkOrder[];
  findByAssignedTo(assignedTo: string): ReworkOrder[];
  findByStatus(status: string): ReworkOrder[];
  create(order: ReworkOrder): ReworkOrder;
  update(id: string, order: Partial<ReworkOrder>): ReworkOrder | undefined;
  delete(id: string): boolean;
}

export interface AlertRepository {
  findAll(): Alert[];
  findById(id: string): Alert | undefined;
  findByType(type: string): Alert[];
  findBySeverity(severity: string): Alert[];
  findUnacknowledged(): Alert[];
  create(alert: Alert): Alert;
  update(id: string, alert: Partial<Alert>): Alert | undefined;
  delete(id: string): boolean;
}

export interface AuthTokenRepository {
  findByToken(token: string): AuthToken | undefined;
  findByUserId(userId: string): AuthToken[];
  create(token: AuthToken): AuthToken;
  delete(token: string): boolean;
  deleteByUserId(userId: string): boolean;
}