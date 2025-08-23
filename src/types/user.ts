export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  password?: string; // Optional for Google OAuth users
  provider: 'credentials' | 'google';
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  confirmPassword: string;
}
