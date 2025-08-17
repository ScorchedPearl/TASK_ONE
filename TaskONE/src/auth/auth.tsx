import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { AnimatePresence, motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Lock, 
  ChefHat, 
  Sparkles, 
  Star,
  Utensils,
  Crown,
  UserIcon,
  LockIcon,
  MailIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useUser } from "@/providers/userprovider";
import { useGoogleLogin } from "@react-oauth/google";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [emailSentFor, setEmailSentFor] = useState<'registration' | 'reset' | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const navigate = () => console.log('Navigate called');

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
            message: "Recipe ingredients don't match",
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
        navigate();
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
          message: error.message || "Kitchen mishap occurred. Please try again."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const googlelogin = useGoogleLogin({
    onSuccess: async (cred: any) => {
      setIsLoading(true);
      try {
        const token = await googleAuth(cred.access_token);
        navigate();
      } catch (error) {
        console.error("Google login failed:", error);
        setError("root", {
          type: "manual",
          message: "Chef's special unavailable. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError("root", {
        type: "manual",
        message: "Chef's special unavailable. Please try again."
      });
    },
    scope: "openid profile email"
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
        message: error.message || "Failed to serve your request"
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
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </div>

        {/* Floating Culinary Icons */}
        <div className="absolute top-20 left-20 opacity-80">
          <Utensils className="w-8 h-8 text-primary/30" />
        </div>
        <div className="absolute top-40 right-32 opacity-70">
          <Crown className="w-10 h-10 text-primary/30" />
        </div>
        <div className="absolute bottom-32 left-32 opacity-60">
          <Sparkles className="w-12 h-12 text-primary/20" />
        </div>

        <Card className="w-[400px] bg-slate-900/50 backdrop-blur-xl border border-primary/20 shadow-xl rounded-lg">
          <div className="p-6 space-y-6 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="bg-primary/20 p-3 rounded-full">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                Recipe Delivered
              </h2>
              
              <p className="text-sm text-slate-300">
                We've served your {emailSentFor === 'registration' ? 'welcome menu' : 'recipe reset'} to{' '}
                <span className="text-primary font-medium">{userEmail}</span>
              </p>
              
              <p className="text-xs text-slate-400">
                {emailSentFor === 'registration' 
                  ? "Please taste your welcome course and confirm your reservation."
                  : "Please follow the recipe to craft your new dining credentials."
                }
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={isLoading}
                variant="outline"
                className="w-full bg-slate-800/50 border border-primary/30 hover:bg-slate-700/50 text-white"
              >
                {isLoading ? "Preparing..." : "Serve Again"}
              </Button>
              
              <Button
                onClick={resetForm}
                variant="link"
                className="w-full text-slate-400 hover:text-primary transition-colors"
              >
                Return to Dining Hall
              </Button>
            </div>

            {errors.root && (
              <p className="text-sm text-red-400 mt-2">
                {errors.root.message}
              </p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      {/* Floating Culinary Icons */}
      <div className="absolute top-20 left-20 opacity-80">
        <ChefHat className="w-10 h-10 text-primary/30" />
      </div>
      <div className="absolute top-40 right-32 opacity-70">
        <Sparkles className="w-8 h-8 text-primary/30" />
      </div>
      <div className="absolute bottom-32 left-32 opacity-60">
        <Star className="w-12 h-12 text-primary/20" />
      </div>
      <div className="absolute bottom-20 right-20 opacity-50">
        <Utensils className="w-6 h-6 text-primary/25" />
      </div>

      <Card className="w-[400px] bg-slate-900/50 backdrop-blur-xl border border-primary/20 shadow-xl rounded-lg">
        <div className="p-6 space-y-6">
          <div className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/20 p-2 rounded-full">
                <ChefHat className="w-6 h-6 text-primary" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
              {isForgotPassword
                ? "Recipe Recovery"
                : isSignUp
                ? "Join Our Kitchen"
                : "Welcome Back, Chef"}
            </h2>
            <p className="text-sm text-slate-300">
              {isForgotPassword
                ? "Enter your details to recover your culinary credentials"
                : isSignUp
                ? "Create your chef profile for an exquisite dining experience"
                : "Sign in to continue your elegant culinary journey"}
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
                  className="w-full flex items-center justify-center gap-3 bg-slate-800/50 border border-primary/30 hover:bg-slate-700/50 text-white py-3 rounded-lg"
                  onClick={() => googlelogin()}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="white"
                      d="M12 10.2V14h5.6c-.3 1.3-1 2.4-2 3.1v2.6h3.2c1.9-1.8 3-4.3 3-7.1 0-.7-.1-1.3-.2-1.9H12z"
                    />
                    <path
                      fill="currentColor"
                      className="text-primary"
                      d="M6.8 14.6l-.9.7-2.5 1.9C5.1 20.8 8.4 23 12 23c3 0 5.5-1 7.4-2.6l-3.2-2.5c-.9.6-2.1 1-3.4 1-2.7 0-5-1.8-5.9-4.3z"
                    />
                    <path
                      fill="currentColor"
                      className="text-primary"
                      d="M3.4 6.7C2.5 8.4 2 10.2 2 12c0 1.8.5 3.6 1.4 5.3l3.4-2.6c-.4-1.1-.6-2.2-.6-2.7 0-.6.2-1.6.6-2.7L3.4 6.7z"
                    />
                    <path
                      fill="white"
                      d="M12 4.8c1.7 0 3.2.6 4.4 1.7L19.5 4C17.5 2.2 14.9 1 12 1 8.4 1 5.1 3.2 3.4 6.7l3.4 2.6C7 6.8 9.3 4.8 12 4.8z"
                    />
                  </svg>
                  <span className="text-white font-medium">
                    Chef's Special Access
                  </span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {!isForgotPassword && !isSignUp && (
            <div className="text-center text-slate-400 text-sm flex items-center">
              <div className="flex-1 h-px bg-slate-700"></div>
              <span className="px-3">or continue with credentials</span>
              <div className="flex-1 h-px bg-slate-700"></div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-2"
                >
                  <Label htmlFor="name" className="text-sm text-slate-300">
                    Chef Name
                  </Label>
                  <div className="relative">
                    <UserIcon
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <Input
                      id="name"
                      {...register("name")}
                      className="pl-10 bg-slate-800/50 border border-slate-700 text-white py-3 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="Enter your chef name"
                      required
                    />
                  </div>
                  {errors.name && typeof errors.name.message === "string" && (
                    <p className="text-sm text-red-400">{errors.name.message}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-slate-300">
                Email Address
              </Label>
              <div className="relative">
                <MailIcon
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <Input
                  id="email"
                  {...register("email")}
                  type="email"
                  className="pl-10 bg-slate-800/50 border border-slate-700 text-white py-3 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Enter your email"
                  required
                />
              </div>
              {errors.email && typeof errors.email.message === "string" && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {!isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-slate-300">
                  {isSignUp ? "Create Password" : "Password"}
                </Label>
                <div className="relative">
                  <LockIcon
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <Input
                    id="password"
                    {...register("password")}
                    type="password"
                    className="pl-10 bg-slate-800/50 border border-slate-700 text-white py-3 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder={isSignUp ? "Create a secure password" : "Enter your password"}
                    required
                  />
                </div>
                {errors.password && typeof errors.password.message === "string" && (
                  <p className="text-sm text-red-400">{errors.password.message}</p>
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
                  <Label htmlFor="confirmPassword" className="text-sm text-slate-300">
                    Confirm Recipe
                  </Label>
                  <div className="relative">
                    <LockIcon
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <Input
                      id="confirmPassword"
                      {...register("confirmPassword")}
                      type="password"
                      className="pl-10 bg-slate-800/50 border border-slate-700 text-white py-3 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                  {errors.confirmPassword && typeof errors.confirmPassword.message === "string" && (
                    <p className="text-sm text-red-400">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-teal-400 text-primary-foreground font-bold px-8 py-3 text-lg flex items-center justify-center hover:opacity-90 transition-opacity rounded-lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Preparing...
                </div>
              ) : (
                <>
                  <ChefHat className="w-4 h-4 mr-2" />
                  {isForgotPassword
                    ? "Send Recovery Recipe"
                    : isSignUp
                    ? "Begin Culinary Journey" 
                    : "Enter Kitchen"}
                </>
              )}
            </Button>

            {errors.root && (
              <p className="text-sm text-red-400 text-center">
                {errors.root.message}
              </p>
            )}
          </form>

          <div className="flex flex-col gap-2">
            <Button
              variant="link"
              className="w-full text-slate-400 hover:text-primary transition-colors"
              onClick={() => {
                setIsForgotPassword(false);
                setIsSignUp(!isSignUp);
              }}
            >
              {isSignUp
                ? "Already have a chef profile? Welcome back"
                : "New to our kitchen? Join the experience"}
            </Button>

            {!isSignUp && (
              <Button
                variant="link"
                className="w-full text-slate-400 hover:text-primary transition-colors"
                onClick={() => setIsForgotPassword(!isForgotPassword)}
              >
                {isForgotPassword ? "Return to sign in" : "Lost your recipe?"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}