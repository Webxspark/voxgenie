import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from "react-router-dom"
import { router } from './config/router'
import { GlobalContextProvider } from './contexts/global'
import { ThemeProvider } from "@/components/theme-provider"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="voxgenie-ui-theme">
      <GlobalContextProvider>
        <RouterProvider router={router} />
      </GlobalContextProvider>
    </ThemeProvider>
  </StrictMode>,
)
