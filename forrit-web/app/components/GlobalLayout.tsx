import Button from './Button'

const className = `
rounded py-1 px-2 mx-2 leading-6 text-black/50
transition-all duration-300 ease-out
hover:px-3 hover:mx-1 hover:text-black hover:bg-neutral-800/5
`

export default function GlobalLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <h1 className="p-4 text-[4rem] text-black font-extrabold leading-none pointer-events-none select-none">
        FORRIT
      </h1>
      <div className="fixed w-full top-20 md:top-5 left-0 right-0">
        <nav className="ml-auto mr-4 flex w-min p-[0.3em] rounded items-center">
          <Button className={className} href="/subscription">
            <span className="icon-[material-symbols--rss-feed] align-[-0.125em]" />
          </Button>
          <Button className={className}>
            <span className="icon-[ic--baseline-browser-updated] align-[-0.125em]" />
          </Button>
          <Button className={className}>
            <span className="icon-[ic--baseline-browser-updated] align-[-0.125em]" />
          </Button>
        </nav>
      </div>

      <main className="flex-grow mt-12 md:mt-4 min-h-screen overflow-x-scroll">
        {children}
      </main>
    </>
  )
}
