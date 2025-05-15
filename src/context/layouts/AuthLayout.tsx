import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <>
     
      <main className="h-screen w-full p-2">
        <Outlet />
      </main>
   
    </>
  )
}

export default  AuthLayout