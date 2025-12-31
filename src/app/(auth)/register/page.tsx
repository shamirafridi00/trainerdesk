'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RegisterSchema, RegisterInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  });

  const password = watch('password');

  const getPasswordStrength = (password: string): string => {
    if (!password) return '';
    if (password.length < 8) return 'weak';
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) return 'medium';
    if (!/[0-9]/.test(password)) return 'medium';
    return 'strong';
  };

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Registration failed');
        return;
      }

      toast.success('Account created successfully! Please sign in.');
      router.push('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            {...register('name')}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Business Name Field */}
        <div>
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            type="text"
            placeholder="My Fitness Studio"
            {...register('businessName')}
            disabled={isLoading}
          />
          {errors.businessName && (
            <p className="text-sm text-red-600 mt-1">
              {errors.businessName.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            disabled={isLoading}
          />
          {password && (
            <div className="mt-2">
              <div className="flex gap-1">
                <div
                  className={`h-1 flex-1 rounded ${
                    passwordStrength === 'weak'
                      ? 'bg-red-500'
                      : passwordStrength === 'medium'
                        ? 'bg-yellow-500'
                        : passwordStrength === 'strong'
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                  }`}
                />
                <div
                  className={`h-1 flex-1 rounded ${
                    passwordStrength === 'medium' ||
                    passwordStrength === 'strong'
                      ? passwordStrength === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
                <div
                  className={`h-1 flex-1 rounded ${
                    passwordStrength === 'strong'
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Password strength:{' '}
                <span
                  className={
                    passwordStrength === 'weak'
                      ? 'text-red-600'
                      : passwordStrength === 'medium'
                        ? 'text-yellow-600'
                        : 'text-green-600'
                  }
                >
                  {passwordStrength}
                </span>
              </p>
            </div>
          )}
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      {/* Login Link */}
      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
