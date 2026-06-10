import { User } from '../models/index.js';
import { JsonUserRepository, JsonAuthTokenRepository } from '../repositories/index.js';
import { generateId, hashPassword, verifyPassword, generateToken, formatDate, isValidEmail } from '../utils/index.js';
import { getConfig } from '../config/index.js';

const userRepo = new JsonUserRepository();
const tokenRepo = new JsonAuthTokenRepository();

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role?: 'operator' | 'supervisor' | 'manager' | 'admin';
  department?: string;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export class UserService {
  async createUser(data: CreateUserData): Promise<{ user: User | null; error?: string }> {
    if (!data.username || !data.email || !data.password) {
      return { user: null, error: 'Username, email and password are required' };
    }

    if (!isValidEmail(data.email)) {
      return { user: null, error: 'Invalid email format' };
    }

    if (userRepo.findByEmail(data.email)) {
      return { user: null, error: 'Email already exists' };
    }

    if (userRepo.findByUsername(data.username)) {
      return { user: null, error: 'Username already exists' };
    }

    const now = formatDate(new Date());
    const user: User = {
      id: generateId(),
      username: data.username,
      email: data.email,
      password: hashPassword(data.password),
      role: data.role || 'operator',
      department: data.department,
      createdAt: now,
      updatedAt: now
    };

    userRepo.create(user);
    return { user };
  }

  async login(usernameOrEmail: string, password: string): Promise<LoginResult> {
    const user = userRepo.findByUsername(usernameOrEmail) || userRepo.findByEmail(usernameOrEmail);

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (!verifyPassword(password, user.password)) {
      return { success: false, error: 'Invalid password' };
    }

    const config = getConfig();
    const token = generateToken(user.id, config.jwtSecret);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    tokenRepo.create({
      userId: user.id,
      token,
      expiresAt,
      createdAt: new Date().toISOString()
    });

    return { success: true, user, token };
  }

  async logout(token: string): Promise<void> {
    tokenRepo.delete(token);
  }

  async validateToken(token: string): Promise<User | null> {
    const storedToken = tokenRepo.findByToken(token);
    if (!storedToken) return null;

    const expiresAt = new Date(storedToken.expiresAt);
    if (expiresAt < new Date()) {
      tokenRepo.delete(token);
      return null;
    }

    return userRepo.findById(storedToken.userId) || null;
  }

  async getUserById(id: string): Promise<User | null> {
    return userRepo.findById(id) || null;
  }

  async getAllUsers(): Promise<User[]> {
    return userRepo.findAll();
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return userRepo.findByRole(role);
  }
}