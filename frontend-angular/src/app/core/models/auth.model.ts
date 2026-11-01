export interface User {
  id: number;
  email: string;
  role: 'ROLE_ADMIN' | 'ROLE_HR_MANAGER' | 'ROLE_EXECUTIVE';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}
