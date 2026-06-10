import { User, ProductionOrder, QualityRecord, Defect, ReworkOrder, Alert, AuthToken } from '../models/index.js';
import { UserRepository, ProductionOrderRepository, QualityRecordRepository, DefectRepository, ReworkOrderRepository, AlertRepository, AuthTokenRepository } from './interfaces.js';
import { loadData, saveData } from '../utils/index.js';

export class JsonUserRepository implements UserRepository {
  private filename = 'users.json';

  findAll(): User[] {
    return loadData<User>(this.filename);
  }

  findById(id: string): User | undefined {
    const users = this.findAll();
    return users.find(u => u.id === id);
  }

  findByEmail(email: string): User | undefined {
    const users = this.findAll();
    return users.find(u => u.email === email);
  }

  findByUsername(username: string): User | undefined {
    const users = this.findAll();
    return users.find(u => u.username === username);
  }

  findByRole(role: string): User[] {
    const users = this.findAll();
    return users.filter(u => u.role === role);
  }

  create(user: User): User {
    const users = this.findAll();
    users.push(user);
    saveData(this.filename, users);
    return user;
  }

  update(id: string, userData: Partial<User>): User | undefined {
    const users = this.findAll();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    users[index] = { ...users[index], ...userData, updatedAt: new Date().toISOString() };
    saveData(this.filename, users);
    return users[index];
  }

  delete(id: string): boolean {
    const users = this.findAll();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return false;
    users.splice(index, 1);
    saveData(this.filename, users);
    return true;
  }
}

export class JsonProductionOrderRepository implements ProductionOrderRepository {
  private filename = 'production_orders.json';

  findAll(): ProductionOrder[] {
    return loadData<ProductionOrder>(this.filename);
  }

  findById(id: string): ProductionOrder | undefined {
    const orders = this.findAll();
    return orders.find(o => o.id === id);
  }

  findByOrderNumber(orderNumber: string): ProductionOrder | undefined {
    const orders = this.findAll();
    return orders.find(o => o.orderNumber === orderNumber);
  }

  findByStatus(status: string): ProductionOrder[] {
    const orders = this.findAll();
    return orders.filter(o => o.status === status);
  }

  findByOperatorId(operatorId: string): ProductionOrder[] {
    const orders = this.findAll();
    return orders.filter(o => o.operatorId === operatorId);
  }

  create(order: ProductionOrder): ProductionOrder {
    const orders = this.findAll();
    orders.push(order);
    saveData(this.filename, orders);
    return order;
  }

  update(id: string, orderData: Partial<ProductionOrder>): ProductionOrder | undefined {
    const orders = this.findAll();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return undefined;
    orders[index] = { ...orders[index], ...orderData, updatedAt: new Date().toISOString() };
    saveData(this.filename, orders);
    return orders[index];
  }

  delete(id: string): boolean {
    const orders = this.findAll();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return false;
    orders.splice(index, 1);
    saveData(this.filename, orders);
    return true;
  }
}

export class JsonQualityRecordRepository implements QualityRecordRepository {
  private filename = 'quality_records.json';

  findAll(): QualityRecord[] {
    return loadData<QualityRecord>(this.filename);
  }

  findById(id: string): QualityRecord | undefined {
    const records = this.findAll();
    return records.find(r => r.id === id);
  }

  findByOrderId(orderId: string): QualityRecord[] {
    const records = this.findAll();
    return records.filter(r => r.orderId === orderId);
  }

  findByInspectorId(inspectorId: string): QualityRecord[] {
    const records = this.findAll();
    return records.filter(r => r.inspectorId === inspectorId);
  }

  findByResult(result: string): QualityRecord[] {
    const records = this.findAll();
    return records.filter(r => r.result === result);
  }

  create(record: QualityRecord): QualityRecord {
    const records = this.findAll();
    records.push(record);
    saveData(this.filename, records);
    return record;
  }

  update(id: string, recordData: Partial<QualityRecord>): QualityRecord | undefined {
    const records = this.findAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    records[index] = { ...records[index], ...recordData, updatedAt: new Date().toISOString() };
    saveData(this.filename, records);
    return records[index];
  }

  delete(id: string): boolean {
    const records = this.findAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return false;
    records.splice(index, 1);
    saveData(this.filename, records);
    return true;
  }
}

export class JsonDefectRepository implements DefectRepository {
  private filename = 'defect_entries.json';

  findAll(): Defect[] {
    return loadData<Defect>(this.filename);
  }

  findById(id: string): Defect | undefined {
    const defects = this.findAll();
    return defects.find(d => d.id === id);
  }

  findByOrderId(orderId: string): Defect[] {
    const defects = this.findAll();
    return defects.filter(d => d.orderId === orderId);
  }

  findByStatus(status: string): Defect[] {
    const defects = this.findAll();
    return defects.filter(d => d.status === status);
  }

  findBySeverity(severity: string): Defect[] {
    const defects = this.findAll();
    return defects.filter(d => d.severity === severity);
  }

  create(defect: Defect): Defect {
    const defects = this.findAll();
    defects.push(defect);
    saveData(this.filename, defects);
    return defect;
  }

  update(id: string, defectData: Partial<Defect>): Defect | undefined {
    const defects = this.findAll();
    const index = defects.findIndex(d => d.id === id);
    if (index === -1) return undefined;
    defects[index] = { ...defects[index], ...defectData, updatedAt: new Date().toISOString() };
    saveData(this.filename, defects);
    return defects[index];
  }

  delete(id: string): boolean {
    const defects = this.findAll();
    const index = defects.findIndex(d => d.id === id);
    if (index === -1) return false;
    defects.splice(index, 1);
    saveData(this.filename, defects);
    return true;
  }
}

export class JsonReworkOrderRepository implements ReworkOrderRepository {
  private filename = 'rework_orders.json';

  findAll(): ReworkOrder[] {
    return loadData<ReworkOrder>(this.filename);
  }

  findById(id: string): ReworkOrder | undefined {
    const orders = this.findAll();
    return orders.find(o => o.id === id);
  }

  findByOrderId(orderId: string): ReworkOrder[] {
    const orders = this.findAll();
    return orders.filter(o => o.orderId === orderId);
  }

  findByAssignedTo(assignedTo: string): ReworkOrder[] {
    const orders = this.findAll();
    return orders.filter(o => o.assignedTo === assignedTo);
  }

  findByStatus(status: string): ReworkOrder[] {
    const orders = this.findAll();
    return orders.filter(o => o.status === status);
  }

  create(order: ReworkOrder): ReworkOrder {
    const orders = this.findAll();
    orders.push(order);
    saveData(this.filename, orders);
    return order;
  }

  update(id: string, orderData: Partial<ReworkOrder>): ReworkOrder | undefined {
    const orders = this.findAll();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return undefined;
    orders[index] = { ...orders[index], ...orderData, updatedAt: new Date().toISOString() };
    saveData(this.filename, orders);
    return orders[index];
  }

  delete(id: string): boolean {
    const orders = this.findAll();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return false;
    orders.splice(index, 1);
    saveData(this.filename, orders);
    return true;
  }
}

export class JsonAlertRepository implements AlertRepository {
  private filename = 'quality_alerts.json';

  findAll(): Alert[] {
    return loadData<Alert>(this.filename);
  }

  findById(id: string): Alert | undefined {
    const alerts = this.findAll();
    return alerts.find(a => a.id === id);
  }

  findByType(type: string): Alert[] {
    const alerts = this.findAll();
    return alerts.filter(a => a.type === type);
  }

  findBySeverity(severity: string): Alert[] {
    const alerts = this.findAll();
    return alerts.filter(a => a.severity === severity);
  }

  findUnacknowledged(): Alert[] {
    const alerts = this.findAll();
    return alerts.filter(a => !a.acknowledged);
  }

  create(alert: Alert): Alert {
    const alerts = this.findAll();
    alerts.push(alert);
    saveData(this.filename, alerts);
    return alert;
  }

  update(id: string, alertData: Partial<Alert>): Alert | undefined {
    const alerts = this.findAll();
    const index = alerts.findIndex(a => a.id === id);
    if (index === -1) return undefined;
    alerts[index] = { ...alerts[index], ...alertData, updatedAt: new Date().toISOString() };
    saveData(this.filename, alerts);
    return alerts[index];
  }

  delete(id: string): boolean {
    const alerts = this.findAll();
    const index = alerts.findIndex(a => a.id === id);
    if (index === -1) return false;
    alerts.splice(index, 1);
    saveData(this.filename, alerts);
    return true;
  }
}

export class JsonAuthTokenRepository implements AuthTokenRepository {
  private filename = 'auth_tokens.json';

  findByToken(token: string): AuthToken | undefined {
    const tokens = loadData<AuthToken>(this.filename);
    return tokens.find(t => t.token === token);
  }

  findByUserId(userId: string): AuthToken[] {
    const tokens = loadData<AuthToken>(this.filename);
    return tokens.filter(t => t.userId === userId);
  }

  create(token: AuthToken): AuthToken {
    const tokens = loadData<AuthToken>(this.filename);
    tokens.push(token);
    saveData(this.filename, tokens);
    return token;
  }

  delete(token: string): boolean {
    const tokens = loadData<AuthToken>(this.filename);
    const index = tokens.findIndex(t => t.token === token);
    if (index === -1) return false;
    tokens.splice(index, 1);
    saveData(this.filename, tokens);
    return true;
  }

  deleteByUserId(userId: string): boolean {
    const tokens = loadData<AuthToken>(this.filename);
    const filtered = tokens.filter(t => t.userId !== userId);
    saveData(this.filename, filtered);
    return true;
  }
}
