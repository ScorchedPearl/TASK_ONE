import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { UserProvider } from './providers/userprovider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <GoogleOAuthProvider clientId="671966318930-hm29ojcbc0taqrq9o772d0ov8fabtcpu.apps.googleusercontent.com">
    <UserProvider>
        <App />
        </UserProvider>
    </GoogleOAuthProvider>
    
  </StrictMode>,
)
