import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../../services/authService';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthService', () => {
  const authService = new AuthService(); // Create instance instead of importing singleton
  
  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    
    // Clear any existing user
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with demo user', () => {
    const user = authService.getCurrentUser();
    expect(user).not.toBeNull();
    expect(user?.email).toBe('demo@example.com');
  });

  it('should allow user registration', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!'
    };

    const newUser = await authService.register(userData);
    
    expect(newUser).toBeDefined();
    expect(newUser.name).toBe('Test User');
    expect(newUser.email).toBe('test@example.com');
    expect(newUser.isLoggedIn).toBe(true);
  });

  it('should prevent duplicate email registration', async () => {
    const userData = {
      name: 'Test User',
      email: 'demo@example.com', // This email already exists
      password: 'Password123!'
    };

    await expect(authService.register(userData)).rejects.toThrow('User with this email already exists');
  });

  it('should allow user login', async () => {
    const credentials = {
      email: 'demo@example.com',
      password: 'any-password' // Password validation is mocked
    };

    const user = await authService.login(credentials);
    
    expect(user).toBeDefined();
    expect(user.email).toBe('demo@example.com');
    expect(user.isLoggedIn).toBe(true);
  });

  it('should handle invalid login', async () => {
    const credentials = {
      email: 'nonexistent@example.com',
      password: 'any-password'
    };

    await expect(authService.login(credentials)).rejects.toThrow('Invalid email or password');
  });

  it('should allow user logout', async () => {
    // First login to set up the user
    const credentials = {
      email: 'demo@example.com',
      password: 'any-password'
    };
    
    await authService.login(credentials);
    expect(authService.isAuthenticated()).toBe(true);
    
    // Then logout
    await authService.logout();
    expect(authService.isAuthenticated()).toBe(false);
  });

  it('should persist user in localStorage after login', async () => {
    const credentials = {
      email: 'demo@example.com',
      password: 'any-password'
    };

    await authService.login(credentials);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'nexus_user',
      expect.any(String)
    );
  });

  it('should check authentication status', () => {
    // Initially not authenticated
    localStorageMock.getItem.mockReturnValue(null);
    expect(authService.isAuthenticated()).toBe(false);
    
    // When user is logged in
    const user = {
      id: 'demo_user',
      name: 'Demo User',
      email: 'demo@example.com',
      balance: 100000,
      positions: [],
      transactions: [],
      watchlist: ['BTC', 'ETH', 'SOL'],
      isLoggedIn: true
    };
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
    expect(authService.isAuthenticated()).toBe(true);
  });
});