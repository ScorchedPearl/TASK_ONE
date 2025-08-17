import { UserProvider } from "@/providers/userprovider";
import { Outlet } from "react-router-dom";

function Layout() {
 return (
  <UserProvider>
  <div className="h-screen w-screen">
   <main className="">
    <Outlet />
   </main>
  </div>
  </UserProvider>
 );
}

export default Layout;
