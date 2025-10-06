import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, RegisterData } from '@/types/user';
import { query, queryOne, RowDataPacket } from './db';

export async function getUsers(): Promise<User[]> {
  try {
    const users = await query<(RowDataPacket & User)[]>(
      'SELECT * FROM users ORDER BY createdAt DESC'
    );
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await queryOne<RowDataPacket & User>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return user;
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
}

export async function findUserById(id: string): Promise<User | null> {
  try {
    const user = await queryOne<RowDataPacket & User>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return user;
  } catch (error) {
    console.error('Error finding user by id:', error);
    return null;
  }
}

export async function createUser(userData: RegisterData): Promise<User> {
  // Check if user already exists
  const existingUser = await findUserByEmail(userData.email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 12);

  const now = new Date();
  
  const newUser: User = {
    id: uuidv4(),
    email: userData.email,
    name: userData.name,
    password: hashedPassword,
    role: userData.role || 'user', // Default to 'user' if not provided
    status: 'active',
    provider: 'credentials',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  try {
    await query(
      `INSERT INTO users (id, email, name, password, provider, role, status, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        newUser.id,
        newUser.email,
        newUser.name,
        newUser.password,
        newUser.provider,
        newUser.role,
        newUser.status,
      ]
    );
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
}

export async function createGoogleUser(profile: { email: string; name: string; picture?: string }): Promise<User> {
  // Check if user already exists
  const existingUser = await findUserByEmail(profile.email);
  if (existingUser) {
    // Update existing user's profile info but keep the role
    try {
      const now = new Date();
      const updatedAt = now.toISOString();
      await query(
        'UPDATE users SET name = ?, image = ?, updatedAt = NOW() WHERE id = ?',
        [profile.name, profile.picture, existingUser.id]
      );
      return { ...existingUser, name: profile.name, image: profile.picture, updatedAt };
    } catch (error) {
      console.error('Error updating Google user:', error);
      throw new Error('Failed to update user');
    }
  }

  const now = new Date();
  
  const newUser: User = {
    id: uuidv4(),
    email: profile.email,
    name: profile.name,
    role: 'user', // Default role for new users
    status: 'active',
    provider: 'google',
    image: profile.picture,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  try {
    await query(
      `INSERT INTO users (id, email, name, provider, role, status, image, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        newUser.id,
        newUser.email,
        newUser.name,
        newUser.provider,
        newUser.role,
        newUser.status,
        newUser.image,
      ]
    );
    return newUser;
  } catch (error) {
    console.error('Error creating Google user:', error);
    throw new Error('Failed to create user');
  }
}

export async function verifyPassword(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email);
  
  if (!user || !user.password || user.provider !== 'credentials') {
    return null;
  }

  //Check status
  if (user.status === 'banned') {
    throw new Error('ACCOUNT_BANNED');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  return isValidPassword ? user : null;
}

export async function updateUserRole(userId: string, newRole: 'user' | 'admin'): Promise<User | null> {
  try {
    await query(
      'UPDATE users SET role = ?, updatedAt = NOW() WHERE id = ?',
      [newRole, userId]
    );
    return await findUserById(userId);
  } catch (error) {
    console.error('Error updating user role:', error);
    return null;
  }
}

export async function updateUserStatus(userId: string, newStatus: 'active' | 'banned'): Promise<User | null> {
  try {
    await query(
      'UPDATE users SET status = ?, updatedAt = NOW() WHERE id = ?',
      [newStatus, userId]
    );
    return await findUserById(userId);
  } catch (error) {
    console.error('Error updating user status:', error);
    return null;
  }
}

export async function updateUserProfile(
  userId: string, 
  profileData: {
    name?: string;
    phone?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    image?: string;
  }
): Promise<User | null> {
  try {
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (profileData.name !== undefined) {
      updates.push('name = ?');
      values.push(profileData.name);
    }
    if (profileData.phone !== undefined) {
      updates.push('phone = ?');
      values.push(profileData.phone);
    }
    if (profileData.address !== undefined) {
      updates.push('address = ?');
      values.push(profileData.address);
    }
    if (profileData.postalCode !== undefined) {
      updates.push('postalCode = ?');
      values.push(profileData.postalCode);
    }
    if (profileData.city !== undefined) {
      updates.push('city = ?');
      values.push(profileData.city);
    }
    if (profileData.image !== undefined) {
      updates.push('image = ?');
      values.push(profileData.image);
    }

    if (updates.length === 0) {
      return await findUserById(userId);
    }

    updates.push('updatedAt = NOW()');
    values.push(userId);

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return await findUserById(userId);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
}
