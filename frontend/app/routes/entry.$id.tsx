import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

export async function loader({ params }: LoaderFunctionArgs) {
  return json({
    id: params.id as string,
  })
}

export default function EntryDetail() {
  const id = useLoaderData<typeof loader>().id
  return <div>Entry: {id}</div>
}
