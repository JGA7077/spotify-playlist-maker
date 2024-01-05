import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex items-center justify-start flex-col gap-12">
      <h1>Playlist Maker</h1>
      <p>An easy way to create your personal playlists!</p>

      <Link href="login" className="py-3 px-4 text-white bg-green-600 rounded-md transition-all duration-300 ease-in hover:scale-110 hover:brightness-110">Login</Link>
    </main>
  )
}
