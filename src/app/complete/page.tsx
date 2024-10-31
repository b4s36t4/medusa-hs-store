"use server"

import { useRouter, useSearchParams } from "next/navigation"

export default async function complete() {
  const router = useRouter()
  const search = useSearchParams()
  console.log(router, search, "seas")
  return (
    <div>
      <p>Complete Page</p>
    </div>
  )
}
