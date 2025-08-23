import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, RegisterData } from '@/types/user';

const USERS_FILE_PATH = path.join(process.cwd(), 'data', 'users.json');

export async function getUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

export async function saveUsers(users: User[]): Promise<void> {
  try {
    await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users file:', error);
    throw new Error('Failed to save users');
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers();
  return users.find(user => user.email === email) || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find(user => user.id === id) || null;
}

export async function createUser(userData: RegisterData): Promise<User> {
  const users = await getUsers();
  
  // Check if user already exists
  const existingUser = users.find(user => user.email === userData.email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 12);

  const newUser: User = {
    id: uuidv4(),
    email: userData.email,
    name: userData.name,
    password: hashedPassword,
    role: userData.role,
    provider: 'credentials',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  await saveUsers(users);

  return newUser;
}

export async function createGoogleUser(profile: { email: string; name: string; picture?: string }): Promise<User> {
  const users = await getUsers();
  
  // Check if user already exists
  const existingUser = users.find(user => user.email === profile.email);
  if (existingUser) {
    // Update existing user's profile info but keep the role
    existingUser.name = profile.name;
    existingUser.image = profile.picture;
    existingUser.updatedAt = new Date().toISOString();
    await saveUsers(users);
    return existingUser;
  }

  const newUser: User = {
    id: uuidv4(),
    email: profile.email,
    name: profile.name,
    role: 'user', // Default role for new users
    provider: 'google',
    image: profile.picture,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  await saveUsers(users);

  return newUser;
}

export async function verifyPassword(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email);
  
  if (!user || !user.password || user.provider !== 'credentials') {
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  return isValidPassword ? user : null;
}

export async function updateUserRole(userId: string, newRole: 'user' | 'admin'): Promise<User | null> {
  const users = await getUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return null;
  }
  
  users[userIndex].role = newRole;
  users[userIndex].updatedAt = new Date().toISOString();
  
  await saveUsers(users);
  return users[userIndex];
}
