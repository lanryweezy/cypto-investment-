import { UserProfile } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: UserProfile | null = null;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  private constructor() {
    // Load tokens from localStorage
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
    
    // Try to restore user session
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data: AuthResponse = await response.json();
      
      // Store tokens
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.currentUser = { ...data.user, isLoggedIn: true, positions: [], transactions: [], watchlist: [] };

      // Persist to localStorage
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
      localStorage.setItem('current_user', JSON.stringify(this.currentUser));

      return this.currentUser;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterData): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data: AuthResponse = await response.json();

      // Store tokens
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.currentUser = { ...data.user, isLoggedIn: true, positions: [], transactions: [], watchlist: [] };

      // Persist to localStorage
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
      localStorage.setItem('current_user', JSON.stringify(this.currentUser));

      return this.currentUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.refreshToken) {
        await fetch(`${this.apiUrl}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken })
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear local state
    this.currentUser = null;
    this.accessToken = null;
    this.refreshToken = null;

    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
  }

  async verifyToken(): Promise<boolean> {
    if (!this.accessToken) return false;

    try {
      const response = await fetch(`${this.apiUrl}/api/auth/verify`, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        this.currentUser = { ...data.user, isLoggedIn: true, positions: [], transactions: [], watchlist: [] };
        return true;
      }

      // Try to refresh token
      return await this.refreshAccessToken();
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${this.apiUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.accessToken;
        localStorage.setItem('access_token', data.accessToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.accessToken !== null;
  }
}

export const authService = AuthService.getInstance();
export type { LoginCredentials, RegisterData };