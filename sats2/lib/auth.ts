export interface User {
  id: string
  email: string
  name: string
  role: "faculty" | "student" | "class_incharge" | "hod" | "principal"
  department?: string
  employeeId?: string
  studentId?: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthResponse {
  success: boolean
  token?: string
  user?: User
  message?: string
}

export class AuthService {
  private static instance: AuthService
  private token: string | null = null

  private constructor() {
    // Initialize token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: "/auth/login",
          ...credentials,
        }),
      })

      const data = await response.json()

      if (data.success && data.token) {
        this.token = data.token
        if (typeof window !== "undefined") {
          if (credentials.rememberMe) {
            localStorage.setItem("auth_token", data.token)
          } else {
            sessionStorage.setItem("auth_token", data.token)
          }
          localStorage.setItem("user_data", JSON.stringify(data.user))
        }
      }

      return data
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        message: "Network error. Please try again.",
      }
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
          body: JSON.stringify({
            endpoint: "/auth/logout",
          }),
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      this.token = null
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
        sessionStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
      }
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) {
      // Try to get user from localStorage if token exists
      if (typeof window !== "undefined") {
        const userData = localStorage.getItem("user_data")
        if (userData) {
          try {
            return JSON.parse(userData)
          } catch {
            return null
          }
        }
      }
      return null
    }

    try {
      const response = await fetch(`/api/auth?endpoint=/auth/me`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        return data.user
      }
    } catch (error) {
      console.error("Get current user error:", error)
    }

    return null
  }

  getToken(): string | null {
    if (!this.token && typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
    }
    return this.token
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  async refreshToken(): Promise<boolean> {
    if (!this.token) return false

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          endpoint: "/auth/refresh",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        this.token = data.token
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", data.token)
        }
        return true
      }
    } catch (error) {
      console.error("Token refresh error:", error)
    }

    return false
  }
}

export const authService = AuthService.getInstance()
