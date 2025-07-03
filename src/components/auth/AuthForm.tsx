import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Globe, Mail, Lock, User, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface AuthFormData {
  email: string
  password: string
  fullName?: string
}

export const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const { signIn, signUp, loading, error, clearError } = useAuthStore()
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AuthFormData>()

  const onSubmit = async (data: AuthFormData) => {
    try {
      clearError()
      if (isSignUp) {
        await signUp(data.email, data.password, data.fullName || '')
        toast.success('Account created successfully!')
      } else {
        await signIn(data.email, data.password)
        toast.success('Signed in successfully!')
      }
      reset()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed'
      toast.error(message)
    }
  }

  // Check if Supabase is configured
  const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-error-600 to-warning-600 rounded-2xl">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Configuration Required</h1>
            <p className="text-gray-600 mt-2">
              Please set up your Supabase credentials to continue
            </p>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4 text-sm text-gray-600">
              <p>To use this application, you need to:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">supabase.com</a></li>
                <li>Copy your project URL and anon key</li>
                <li>Set the environment variables in your .env file</li>
              </ol>
              <div className="bg-gray-100 p-3 rounded-lg font-mono text-xs">
                VITE_SUPABASE_URL=your_project_url<br/>
                VITE_SUPABASE_ANON_KEY=your_anon_key
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl">
              <Globe className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AI Web Scraper</h1>
          <p className="text-gray-600 mt-2">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-error-600" />
                <p className="text-sm text-error-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isSignUp && (
              <Input
                label="Full Name"
                icon={<User className="h-5 w-5 text-gray-400" />}
                {...register('fullName', { required: isSignUp ? 'Full name is required' : false })}
                error={errors.fullName?.message}
              />
            )}
            
            <Input
              label="Email"
              type="email"
              icon={<Mail className="h-5 w-5 text-gray-400" />}
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              error={errors.email?.message}
            />
            
            <Input
              label="Password"
              type="password"
              icon={<Lock className="h-5 w-5 text-gray-400" />}
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              error={errors.password?.message}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              loading={loading}
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                clearError()
                reset()
              }}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>

          {/* Debug info in development */}
          {import.meta.env.DEV && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
              <p><strong>Debug Info:</strong></p>
              <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing'}</p>
              <p>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}