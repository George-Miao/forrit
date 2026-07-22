import { redirect } from '@remix-run/react'

export const clientLoader = () => redirect('/meta')

export default function IndexRedirect() {
  return null
}
