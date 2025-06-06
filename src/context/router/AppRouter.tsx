import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { routes } from '../../config/routes'
import { AuthProvider } from '../../config/security/AuthContext'
import '../../index.css'

// Envolvemos las rutas con el AuthProvider, pero mantenemos el RouterProvider
const AppRouter = () => {
  // Creamos el router con las rutas configuradas
  const router = createBrowserRouter(routes)
  
  // Envolvemos el RouterProvider con nuestro AuthProvider
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default AppRouter