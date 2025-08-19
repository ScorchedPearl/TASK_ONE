import { Card } from "@/components/ui/card";
import { User, Mail, ChefHat, Sparkles, Star, Utensils, Crown, Loader } from "lucide-react";
import { useUser } from "@/providers/userprovider";

export default function ProfilePage() {
 const { currentUser } = useUser();

 if (!currentUser) {
  return (
   <div className="min-h-screen flex items-center justify-center">
    <Loader />
   </div>
  );
 }

 return (
  <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
   <div className="absolute inset-0 pointer-events-none">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff22_1px,transparent_1px)] bg-[size:2rem_2rem] sm:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
   </div>

   <div className="absolute top-10 sm:top-20 left-4 sm:left-20 opacity-60 sm:opacity-80">
    <ChefHat className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
   </div>
   <div className="absolute top-20 sm:top-40 right-8 sm:right-32 opacity-50 sm:opacity-70">
    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
   </div>
   <div className="absolute bottom-16 sm:bottom-32 left-6 sm:left-32 opacity-40 sm:opacity-60">
    <Star className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
   </div>
   <div className="absolute bottom-8 sm:bottom-20 right-4 sm:right-20 opacity-30 sm:opacity-50">
    <Utensils className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
   </div>
   <div className="absolute top-1/2 left-2 sm:left-10 opacity-20 sm:opacity-40">
    <Crown className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
   </div>

   <Card className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl bg-slate-900/50 dark:bg-slate-950/50 backdrop-blur-xl shadow-xl rounded-lg border border-slate-700">
    <div className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-6 sm:space-y-8 lg:space-y-10">
     <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div className="bg-primary/20 p-2 sm:p-3 rounded-full self-start">
       <User className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
       <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
        Your Profile
       </h1>
       <p className="text-sm sm:text-base lg:text-lg text-slate-300 dark:text-slate-400 mt-1">
        Account overview
       </p>
      </div>
     </div>

     <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 lg:gap-8">
      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden bg-slate-800/50 border-2 border-slate-700 mx-auto sm:mx-0 flex-shrink-0">
       {currentUser.profileImage ? (
        <img 
         src={currentUser.profileImage} 
         alt="Profile" 
         className="w-full h-full object-cover"
        />
       ) : (
        <div className="w-full h-full flex items-center justify-center">
         <User className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-slate-400" />
        </div>
       )}
      </div>
      
      <div className="flex-1 space-y-2 sm:space-y-3 text-center sm:text-left min-w-0">
       <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white break-words">
        {currentUser.name || 'No name set'}
       </h2>
       <div className="flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base lg:text-lg">
        <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <p className="text-slate-300 dark:text-slate-400 break-all">
         {currentUser.email}
        </p>
       </div>
      </div>
     </div>

     <div className="border-t border-slate-700 pt-4 sm:pt-6 lg:pt-8">
      <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-3 sm:mb-4 text-center sm:text-left">
       Account Information
      </h3>
      <div className="space-y-2 sm:space-y-3 text-sm sm:text-base lg:text-lg">
       <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
        <span className="text-slate-400 font-medium">Account Status</span>
        <span className="text-green-400 font-semibold text-center sm:text-right">Active</span>
       </div>
       <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
        <span className="text-slate-400 font-medium">Email</span>
        <span className="text-slate-300 break-all text-center sm:text-right">{currentUser.email}</span>
       </div>
       
       <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 pt-2 border-t border-slate-700/50">
        <span className="text-slate-400 font-medium">Member Since</span>
        <span className="text-slate-300 text-center sm:text-right">
         {new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
         })}
        </span>
       </div>
      </div>
     </div>
    </div>
   </Card>
  </div>
 );
}