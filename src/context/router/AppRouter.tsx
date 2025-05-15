import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { routes } from '../../config/routes'
import '../../index.css'
const router = createBrowserRouter(routes)

const AppRouter = () => {
  return <RouterProvider router={router} />
}

export default AppRouter