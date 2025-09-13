import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
            <div className="h-8 w-8 bg-white rounded transform rotate-12"></div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Sign In to Your Account</h2>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
