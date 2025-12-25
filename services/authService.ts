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

class AuthService {
  private static instance: AuthService;
  private currentUser: UserProfile | null = null;
  private users: UserProfile[] = [];

  private constructor() {
    // Initialize with some mock users for development
    this.users = [
      {
        id: 'demo_user',
        name: 'Demo User',
        email: 'demo@example.com',
        balance: 100000,
        positions: [],
        transactions: [],
        watchlist: ['BTC', 'ETH', 'SOL'],
        isLoggedIn: false
      }
    ];
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<UserProfile> {
    // In a real application, this would make an API call to your backend
    const user = this.users.find(u => u.email === credentials.email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // In a real app, you'd verify the password hash here
    // For now, we'll simulate a successful login
    user.isLoggedIn = true;
    this.currentUser = user;
    
    // Store user session
    localStorage.setItem('nexus_user', JSON.stringify(user));
    
    return user;
  }

  async register(userData: RegisterData): Promise<UserProfile> {
    // Check if user already exists
    const existingUser = this.users.find(u => u.email === userData.email);
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      balance: 100000, // Default starting balance
      positions: [],
      transactions: [],
      watchlist: ['BTC', 'ETH', 'SOL'],
      isLoggedIn: true
    };

    this.users.push(newUser);
    this.currentUser = newUser;
    
    // Store user session
    localStorage.setItem('nexus_user', JSON.stringify(newUser));
    
    return newUser;
  }

  async logout(): Promise<void> {
    if (this.currentUser) {
      this.currentUser.isLoggedIn = false;
    }
    this.currentUser = null;
    localStorage.removeItem('nexus_user');
  }

  getCurrentUser(): UserProfile | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Check if there's a user in localStorage
    const storedUser = localStorage.getItem('nexus_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as UserProfile;
        if (user.isLoggedIn) {
          this.currentUser = user;
          return user;
        }
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }

    return null;
  }

  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.isLoggedIn;
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    // Update user profile
    this.currentUser = {
      ...this.currentUser,
      ...updates
    };

    // Update in the users array
    const userIndex = this.users.findIndex(u => u.id === this.currentUser?.id);
    if (userIndex !== -1) {
      this.users[userIndex] = this.currentUser;
    }

    // Update localStorage
    localStorage.setItem('nexus_user', JSON.stringify(this.currentUser));

    return this.currentUser;
  }

  async resetPassword(email: string): Promise<void> {
    // In a real application, this would send a password reset email
    // For now, just simulate the process
    console.log(`Password reset requested for: ${email}`);
  }
}

export const authService = AuthService.getInstance();
export type { LoginCredentials, RegisterData };