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
      'SELECT * FROM users WHERE email = $1',
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
      'SELECT * FROM users WHERE id = $1',
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
      `INSERT INTO users (id, email, name, password, provider, role, status, "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
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
        'UPDATE users SET name = $1, image = $2, "updatedAt" = NOW() WHERE id = $3',
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
      `INSERT INTO users (id, email, name, provider, role, status, image, "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
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
      'UPDATE users SET role = $1, "updatedAt" = NOW() WHERE id = $2',
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
      'UPDATE users SET status = $1, "updatedAt" = NOW() WHERE id = $2',
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
    let paramIndex = 1;

    if (profileData.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(profileData.name);
    }
    if (profileData.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(profileData.phone);
    }
    if (profileData.address !== undefined) {
      updates.push(`address = $${paramIndex++}`);
      values.push(profileData.address);
    }
    if (profileData.postalCode !== undefined) {
      updates.push(`"postalCode" = $${paramIndex++}`);
      values.push(profileData.postalCode);
    }
    if (profileData.city !== undefined) {
      updates.push(`city = $${paramIndex++}`);
      values.push(profileData.city);
    }
    if (profileData.image !== undefined) {
      updates.push(`image = $${paramIndex++}`);
      values.push(profileData.image);
    }

    if (updates.length === 0) {
      return await findUserById(userId);
    }

    updates.push('"updatedAt" = NOW()');
    values.push(userId);

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    return await findUserById(userId);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
}
