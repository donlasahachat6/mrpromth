/**
 * Mock Authentication
 * ใช้เมื่อ Supabase ไม่พร้อมใช้งาน
 */

export interface MockUser {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  createdAt: Date
}

class MockAuthService {
  private currentUser: MockUser | null = null
  private users: Map<string, MockUser> = new Map()

  constructor() {
    // สร้าง demo users
    this.users.set('demo@example.com', {
      id: 'demo-user-1',
      email: 'demo@example.com',
      name: 'Demo User',
      role: 'user',
      createdAt: new Date(),
    })

    this.users.set('admin@example.com', {
      id: 'admin-user-1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date(),
    })
  }

  /**
   * Login with email/password
   */
  async signIn(email: string, password: string): Promise<{ user: MockUser | null; error: string | null }> {
    // ใน mock mode ยอมรับ password ใดก็ได้
    const user = this.users.get(email)

    if (!user) {
      return {
        user: null,
        error: 'Invalid email or password',
      }
    }

    this.currentUser = user

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('mock_user', JSON.stringify(user))
    }

    return {
      user,
      error: null,
    }
  }

  /**
   * Sign up new user
   */
  async signUp(email: string, password: string, name?: string): Promise<{ user: MockUser | null; error: string | null }> {
    if (this.users.has(email)) {
      return {
        user: null,
        error: 'Email already exists',
      }
    }

    const newUser: MockUser = {
      id: `mock-user-${Date.now()}`,
      email,
      name: name || email.split('@')[0],
      role: 'user',
      createdAt: new Date(),
    }

    this.users.set(email, newUser)
    this.currentUser = newUser

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('mock_user', JSON.stringify(newUser))
    }

    return {
      user: newUser,
      error: null,
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    this.currentUser = null

    if (typeof window !== 'undefined') {
      localStorage.removeItem('mock_user')
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<MockUser | null> {
    if (this.currentUser) {
      return this.currentUser
    }

    // Try to restore from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mock_user')
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored)
          return this.currentUser
        } catch {
          // Invalid data
          localStorage.removeItem('mock_user')
        }
      }
    }

    return null
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user !== null
  }

  /**
   * OAuth sign in (mock)
   */
  async signInWithOAuth(provider: 'github' | 'google'): Promise<{ url: string | null; error: string | null }> {
    // ใน mock mode ให้ login ด้วย demo user
    const demoUser = this.users.get('demo@example.com')!
    this.currentUser = demoUser

    if (typeof window !== 'undefined') {
      localStorage.setItem('mock_user', JSON.stringify(demoUser))
    }

    return {
      url: '/chat', // Redirect to chat
      error: null,
    }
  }
}

// Export singleton instance
export const mockAuth = new MockAuthService()

/**
 * Check if should use mock auth
 */
export function shouldUseMockAuth(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return !supabaseUrl || !supabaseKey || supabaseKey.includes('placeholder')
}

/**
 * Get auth service (real or mock)
 */
export function getAuthService() {
  if (shouldUseMockAuth()) {
    return {
      type: 'mock' as const,
      service: mockAuth,
    }
  }

  return {
    type: 'supabase' as const,
    service: null, // Will use Supabase client
  }
}
