import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { useUser } from '@/providers/userprovider';
import { LockIcon, CheckCircle, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";

export default function PasswordResetPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useUser();

  type PasswordResetForm = {
    password: string;
    confirmPassword: string;
  };

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<PasswordResetForm>();

  const token = searchParams.get('token');

  const onSubmit = async (data: { password: string; confirmPassword: string }) => {
    if (!token) {
      setError('root', {
        type: 'manual',
        message: 'Invalid reset link. No token provided.'
      });
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match'
      });
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(token, data.password);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: error.message || 'Password reset failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/auth');
  };

  if (!token) {
    return (
      <div>
        <section className="relative min-h-screen bg-black overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
          </div>

          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
          
          <div className="flex justify-center items-center h-screen">
            <Card className="w-[400px] bg-black/50 backdrop-blur-xl border border-white/10 shadow-xl rounded-lg">
              <div className="p-6 space-y-6 text-center">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-red-500/20 p-3 rounded-full">
                      <XCircle className="w-8 h-8 text-red-400" />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-200 bg-clip-text text-transparent">
                    Invalid Reset Link
                  </h2>
                  
                  <p className="text-sm text-gray-400">
                    This password reset link is invalid or has expired.
                  </p>
                </div>

                <Button
                  onClick={handleGoToLogin}
                  className="w-full bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-200 text-black font-semibold hover:opacity-90 transition-opacity rounded-lg py-2"
                >
                  Back to Login
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div>
        <section className="relative min-h-screen bg-black overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
          </div>

          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
          
          <div className="flex justify-center items-center h-screen">
            <Card className="w-[400px] bg-black/50 backdrop-blur-xl border border-white/10 shadow-xl rounded-lg">
              <div className="p-6 space-y-6 text-center">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-green-500/20 p-3 rounded-full">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-200 bg-clip-text text-transparent">
                    Password Reset Successfully!
                  </h2>
                  
                  <p className="text-sm text-gray-400">
                    Your password has been updated. You can now sign in with your new password.
                  </p>
                  
                  <p className="text-xs text-gray-500">
                    Redirecting you to login in 3 seconds...
                  </p>
                </div>

                <Button
                  onClick={handleGoToLogin}
                  className="w-full bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-200 text-black font-semibold hover:opacity-90 transition-opacity rounded-lg py-2"
                >
                  Go to Login
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className="relative min-h-screen bg-black overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </div>

        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="flex justify-center items-center h-screen">
          <Card className="w-[400px] bg-black/50 backdrop-blur-xl border border-white/10 shadow-xl rounded-lg">
            <div className="p-6 space-y-6">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-200 bg-clip-text text-transparent">
                  Reset Your Password
                </h2>
                <p className="text-sm text-gray-400">
                  Enter your new password below
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm text-gray-300">
                    New Password
                  </Label>
                  <div className="relative">
                    <LockIcon
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <Input
                      id="password"
                      {...register("password", { 
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters"
                        }
                      })}
                      type="password"
                      className="pl-10 bg-white/5 border border-white/10 text-white py-2 rounded-lg"
                      placeholder="Enter your new password"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm text-gray-300">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <LockIcon
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <Input
                      id="confirmPassword"
                      {...register("confirmPassword", { 
                        required: "Please confirm your password" 
                      })}
                      type="password"
                      className="pl-10 bg-white/5 border border-white/10 text-white py-2 rounded-lg"
                      placeholder="Confirm your new password"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-200 text-black font-semibold hover:opacity-90 transition-opacity rounded-lg py-2"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
                {errors.root && (
                  <p className="text-sm text-red-500 text-center">
                    {errors.root.message}
                  </p>
                )}
              </form>

              <Button
                variant="link"
                className="w-full text-gray-400 hover:text-white transition-colors"
                onClick={handleGoToLogin}
                disabled={isLoading}
              >
                Back to Login
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}