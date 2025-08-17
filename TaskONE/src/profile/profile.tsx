import { Card } from "@/components/ui/card";
import { User, Mail, ChefHat, Sparkles, Star, Utensils, Crown, Loader } from "lucide-react";
import { useUser } from "@/providers/userprovider";

export default function ProfilePage() {
 const { currentUser } = useUser();

 if (!currentUser) {
  return (
   <Loader></Loader>
  );
 }

 return (
  <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white py-8">
   <div className="absolute inset-0 pointer-events-none">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
   </div>

   <div className="absolute top-20 left-20 opacity-80">
    <ChefHat className="w-10 h-10" />
   </div>
   <div className="absolute top-40 right-32 opacity-70">
    <Sparkles className="w-8 h-8" />
   </div>
   <div className="absolute bottom-32 left-32 opacity-60">
    <Star className="w-12 h-12" />
   </div>
   <div className="absolute bottom-20 right-20 opacity-50">
    <Utensils className="w-6 h-6" />
   </div>
   <div className="absolute top-1/2 left-10 opacity-40">
    <Crown className="w-8 h-8" />
   </div>

   <Card className="w-[700px] bg-slate-900/50 dark:bg-slate-950/50 backdrop-blur-xl shadow-xl rounded-lg border border-slate-700">
    <div className="p-10 space-y-10">

     <div className="flex items-center gap-4">
      <div className="bg-primary/20 p-3 rounded-full">
       <User className="w-8 h-8 text-primary" />
      </div>
      <div>
       <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
        Your Profile
       </h1>
       <p className="text-lg text-slate-300 dark:text-slate-400">
        Account overview
       </p>
      </div>
     </div>

  
     <div className="flex items-start gap-8">
      <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-800/50 border-2 border-slate-700">
       {currentUser.profileImage ? (
        <img 
         src={currentUser.profileImage} 
         alt="Profile" 
         className="w-full h-full object-cover"
        />
       ) : (
        <div className="w-full h-full flex items-center justify-center">
         <User className="w-12 h-12 text-slate-400" />
        </div>
       )}
      </div>
      <div className="flex-1 space-y-2">
       <h2 className="text-2xl font-semibold text-white">
        {currentUser.name || 'No name set'}
       </h2>
       <p className="text-slate-300 dark:text-slate-400 flex items-center gap-2 text-lg">
        <Mail className="w-5 h-5" />
        {currentUser.email}
       </p>
      </div>
     </div>

     <div className="border-t border-slate-700 pt-8">
      <h3 className="text-xl font-semibold text-white mb-4">Account Information</h3>
      <div className="space-y-3 text-lg">
       <div className="flex justify-between">
        <span className="text-slate-400">Account Status</span>
        <span className="text-green-400">Active</span>
       </div>
       <div className="flex justify-between">
        <span className="text-slate-400">Email</span>
        <span className="text-slate-300">{currentUser.email}</span>
       </div>
      </div>
     </div>
    </div>
   </Card>
  </div>
 );
}
