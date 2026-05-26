export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  faculty?: string;
  university?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  faculty?: string;
  university?: string;
  bio?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}
