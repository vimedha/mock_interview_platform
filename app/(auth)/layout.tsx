import { isAuthenticated } from '@/lib/actions/auth.action'
import { redirect } from 'next/navigation';
import {ReactNode} from 'react'

const Authlayout =async ({children}:{children: ReactNode}) => {
  const isUserAuthenticated=await isAuthenticated();
  if(process.env.NODE_ENV !== 'development' && isUserAuthenticated) redirect('/')
  return (
    <div className="auth-layout">
      {children}
    </div>
  )
}

export default Authlayout
