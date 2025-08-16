import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Auth from '@/auth/auth';
import Error from '@/error/error';
import Home from '@/home/home';
import Layout from '@/layout/layout';
function App() {
  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<Error/>} />
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
