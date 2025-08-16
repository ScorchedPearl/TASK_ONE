import { Outlet, Link } from "react-router-dom";

function Layout() {
 return (
  <div className="flex flex-col min-h-screen">
   <header className="bg-black text-white p-4">
    <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
     <h1 className="text-2xl font-bold mb-2 sm:mb-0">My App</h1>
     <nav className="flex space-x-4">
      <Link to="/" className="hover:text-gray-300 transition-colors">Home</Link>
      <Link to="/auth" className="hover:text-gray-300 transition-colors">Auth</Link>
     </nav>
    </div>
   </header>

   <main className="flex-1 container mx-auto p-6">
    <Outlet />
   </main>

   <footer className="bg-gray-900 text-white py-4 mt-8">
    <div className="container mx-auto text-center">
     <p>Vishwas</p>
    </div>
   </footer>
  </div>
 );
}

export default Layout;
