// "use client"

// import { useRouter, useSearchParams } from 'next/navigation'
// import { trpc } from '../_trpc/client'
// import { Loader2 } from 'lucide-react'

// const Page = () => {
//   const router = useRouter()

//   const searchParams = useSearchParams()
//   const origin = searchParams.get('origin')

//   trpc.authCallback.useQuery(undefined, {
//     onSuccess: ({ success }:any) => {
//       if (success) {
//         // user is synced to db
//         router.push(origin ? `/${origin}` : '/dashboard')
//       }
//     },
//     onError: (err:any) => {
//       if (err.data?.code === 'UNAUTHORIZED') {
//         router.push('/sign-in')
//       }
//     },
//     retry: true,
//     retryDelay: 500,
//   })

//   return (
//     <div className='w-full mt-24 flex justify-center'>
//       <div className='flex flex-col items-center gap-2'>
//         <Loader2 className='h-8 w-8 animate-spin text-zinc-800' />
//         <h3 className='font-semibold text-xl'>
//           Setting up your account...
//         </h3>
//         <p>You will be redirected automatically.</p>
//       </div>
//     </div>
//   )
// }

// export default Page


"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '../_trpc/client'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

const Page = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const origin = searchParams.get('origin')

  const { data, error, isLoading } = trpc.authCallback.useQuery(undefined, {
    retry: true,
    retryDelay: 500,
  })

  useEffect(() => {
    if (data?.success) {
      // user is synced to db
      router.push(origin ? `/${origin}` : '/dashboard')
    } else if (error?.data?.code === 'UNAUTHORIZED') {
      router.push('/sign-in')
    }
  }, [data, error, origin, router])

  if (isLoading) {
    return (
      <div className='w-full mt-24 flex justify-center'>
        <div className='flex flex-col items-center gap-2'>
          <Loader2 className='h-8 w-8 animate-spin text-zinc-800' />
          <h3 className='font-semibold text-xl'>
            Setting up your account...
          </h3>
          <p>You will be redirected automatically.</p>
        </div>
      </div>
    )
  }

  return null
}

export default Page