import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { UserProvider } from './providers/userprovider'

document.title = 'PearlChef'

function setFavicon(src: string) {
  const head = document.getElementsByTagName('head')[0]
  const rels = ['icon', 'shortcut icon', 'apple-touch-icon']
  rels.forEach((rel) => {
    let link = head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.rel = rel
      head.appendChild(link)
    }
    link.href = src
  })
}

setFavicon('/pearlchef-favicon.png')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="671966318930-hm29ojcbc0taqrq9o772d0ov8fabtcpu.apps.googleusercontent.com">
      <UserProvider>
        <App />
      </UserProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
