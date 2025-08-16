import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUser } from "@/providers/userprovider";
import { Label } from "@radix-ui/react-label";
import { useGoogleLogin } from "@react-oauth/google";
import type { TokenResponse } from "@react-oauth/google";
import { AnimatePresence, motion } from "framer-motion";
import { UserIcon, MailIcon, LockIcon, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [emailSentFor, setEmailSentFor] = useState<'registration' | 'reset' | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const navigate=useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  const { 
    currentUser, 
    googleAuth, 
    signUp, 
    signIn, 
    forgotPassword,
    resendVerification 
  } = useUser();

  useEffect(() => {
    if (currentUser) {
      navigate("/flow");
    }
  }, [currentUser]);

  const onSubmit = async (data: { 
    email?: string; 
    password?: string; 
    name?: string; 
    confirmPassword?: string 
  }) => {
    setIsLoading(true);
    clearErrors();

    try {
      if (isForgotPassword) {
        const email = data.email as string;
        await forgotPassword(email);
        setUserEmail(email);
        setEmailSentFor('reset');
        setShowEmailSent(true);
      } else if (isSignUp) {
        const email = data.email as string;
        const password = data.password as string;
        const name = data.name as string;

        if (password !== data.confirmPassword) {
          setError("confirmPassword", {
            type: "manual",
            message: "Passwords do not match",
          });
          return;
        }

        await signUp(email, password, name);
        setUserEmail(email);
        setEmailSentFor('registration');
        setShowEmailSent(true);
      } else {
        const email = data.email as string;
        const password = data.password as string;
        await signIn(email, password);
        navigate("/flow");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.message?.includes('email')) {
        setError("email", {
          type: "manual",
          message: error.message
        });
      } else if (error.message?.includes('password')) {
        setError("password", {
          type: "manual",
          message: error.message
        });
      } else {
        setError("root", {
          type: "manual",
          message: error.message || "An error occurred. Please try again."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const googlelogin = useGoogleLogin({
    onSuccess: async (cred: TokenResponse) => {
      setIsLoading(true);
      try {
        const token = await googleAuth(cred.access_token);
        navigate("/flow");
      } catch (error) {
        console.error("Google login failed:", error);
        setError("root", {
          type: "manual",
          message: "Google authentication failed. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      console.log("Google Login Failed");
      setError("root", {
        type: "manual",
        message: "Google authentication failed. Please try again."
      });
    },
    scope: "openid profile email https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.send",
  });

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      if (emailSentFor === 'registration') {
        await resendVerification(userEmail);
      } else if (emailSentFor === 'reset') {
        await forgotPassword(userEmail);
      }
    } catch (error: any) {
      setError("root", {
        type: "manual",
        message: error.message || "Failed to resend email"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setShowEmailSent(false);
    setEmailSentFor(null);
    setUserEmail("");
    setIsForgotPassword(false);
    setIsSignUp(false);
    reset();
    clearErrors();
  };

  if (showEmailSent) {
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
                      <Mail className="w-8 h-8 text-green-400" />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-200 bg-clip-text text-transparent">
                    Check Your Email
                  </h2>
                  
                  <p className="text-sm text-gray-400">
                    We've sent a {emailSentFor === 'registration' ? 'verification' : 'reset'} link to{' '}
                    <span className="text-cyan-400 font-medium">{userEmail}</span>
                  </p>
                  
                  <p className="text-xs text-gray-500">
                    {emailSentFor === 'registration' 
                      ? "Please click the verification link to complete your account setup."
                      : "Please click the reset link to create a new password."
                    }
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleResendEmail}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                  >
                    {isLoading ? "Sending..." : "Resend Email"}
                  </Button>
                  
                  <Button
                    onClick={resetForm}
                    variant="link"
                    className="w-full text-gray-400 hover:text-white transition-colors"
                  >
                    Back to Login
                  </Button>
                </div>

                {errors.root && (
                  <p className="text-sm text-red-500 mt-2">
                    {errors.root.message}
                  </p>
                )}
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
                  {isForgotPassword
                    ? "Reset Password"
                    : isSignUp
                    ? "Create Account"
                    : "Welcome Back"}
                </h2>
                <p className="text-sm text-gray-400">
                  {isForgotPassword
                    ? "Enter your email to receive a reset link"
                    : isSignUp
                    ? "Sign up for an amazing experience"
                    : "Sign in to continue your journey"}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {!isForgotPassword && !isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-2 rounded-lg"
                      onClick={() => googlelogin()}
                      disabled={isLoading}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="white"
                          d="M12 10.2V14h5.6c-.3 1.3-1 2.4-2 3.1v2.6h3.2c1.9-1.8 3-4.3 3-7.1 0-.7-.1-1.3-.2-1.9H12z"
                        />
                        <path
                          fill="cyan"
                          d="M6.8 14.6l-.9.7-2.5 1.9C5.1 20.8 8.4 23 12 23c3 0 5.5-1 7.4-2.6l-3.2-2.5c-.9.6-2.1 1-3.4 1-2.7 0-5-1.8-5.9-4.3z"
                        />
                        <path
                          fill="cyan"
                          d="M3.4 6.7C2.5 8.4 2 10.2 2 12c0 1.8.5 3.6 1.4 5.3l3.4-2.6c-.4-1.1-.6-2.2-.6-2.7 0-.6.2-1.6.6-2.7L3.4 6.7z"
                        />
                        <path
                          fill="white"
                          d="M12 4.8c1.7 0 3.2.6 4.4 1.7L19.5 4C17.5 2.2 14.9 1 12 1 8.4 1 5.1 3.2 3.4 6.7l3.4 2.6C7 6.8 9.3 4.8 12 4.8z"
                        />
                      </svg>
                      <span className="text-white font-medium">
                        Continue With Google
                      </span>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

             // Replace the entire form section with this:

<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
  <AnimatePresence mode="wait">
    {isSignUp && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-2"
      >
        <Label htmlFor="name" className="text-sm text-gray-300">
          Name
        </Label>
        <div className="relative">
          <UserIcon
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            id="name"
            {...register("name")}
            className="pl-10 bg-white/5 border border-white/10 text-white py-2 rounded-lg"
            placeholder="Enter your name"
            required
          />
        </div>
        {errors.name && typeof errors.name.message === "string" && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </motion.div>
    )}
  </AnimatePresence>

  <div className="space-y-2">
    <Label htmlFor="email" className="text-sm text-gray-300">
      Email
    </Label>
    <div className="relative">
      <MailIcon
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        size={18}
      />
      <Input
        id="email"
        {...register("email")}
        type="email"
        className="pl-10 bg-white/5 border border-white/10 text-white py-2 rounded-lg"
        placeholder="Enter your email"
        required
      />
    </div>
    {errors.email && typeof errors.email.message === "string" && (
      <p className="text-sm text-red-500">{errors.email.message}</p>
    )}
  </div>

  {/* Password field - show for sign in and sign up, hide for forgot password */}
  {!isForgotPassword && (
    <div className="space-y-2">
      <Label htmlFor="password" className="text-sm text-gray-300">
        Password
      </Label>
      <div className="relative">
        <LockIcon
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        <Input
          id="password"
          {...register("password")}
          type="password"
          className="pl-10 bg-white/5 border border-white/10 text-white py-2 rounded-lg"
          placeholder="Enter your password"
          required
        />
      </div>
      {errors.password && typeof errors.password.message === "string" && (
        <p className="text-sm text-red-500">{errors.password.message}</p>
      )}
    </div>
  )}

  <AnimatePresence mode="wait">
    {isSignUp && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="space-y-2"
      >
        <Label htmlFor="confirmPassword" className="text-sm text-gray-300">
          Confirm Password
        </Label>
        <div className="relative">
          <LockIcon
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            id="confirmPassword"
            {...register("confirmPassword")}
            type="password"
            className="pl-10 bg-white/5 border border-white/10 text-white py-2 rounded-lg"
            placeholder="Confirm your password"
            required
          />
        </div>
        {errors.confirmPassword && typeof errors.confirmPassword.message === "string" && (
          <p className="text-sm text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </motion.div>
    )}
  </AnimatePresence>

  <Button
    type="submit"
    disabled={isLoading}
    className="w-full bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-200 text-black font-semibold hover:opacity-90 transition-opacity rounded-lg py-2"
  >
    {isLoading 
      ? "Loading..." 
      : isForgotPassword
      ? "Send Reset Link"
      : isSignUp
      ? "Create Account" 
      : "Sign In"}
  </Button>

  {/* Global Error Message */}
  {errors.root && (
    <p className="text-sm text-red-500 text-center">
      {errors.root.message}
    </p>
  )}
</form>

             <Button
  variant="link"
  className="w-full text-gray-400 hover:text-white transition-colors"
  onClick={() => {
    setIsForgotPassword(false);
    setIsSignUp(!isSignUp);
  }}
>
  {isSignUp
    ? "Already have an account? Sign In"
    : "Don't have an account? Sign Up"}
</Button>

{!isSignUp && (
  <Button
    variant="link"
    className="w-full text-gray-400 hover:text-white transition-colors"
    onClick={() => setIsForgotPassword(!isForgotPassword)}
  >
    {isForgotPassword ? "Back to Sign In" : "Forgot Password?"}
  </Button>
)}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}