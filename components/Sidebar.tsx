import React from 'react'
import Link from 'next/link'

const Sidebar = () => {
  return (
    <div className="h-screen w-56 bg-gray-900 text-white fixed top-0 left-0 p-6">
      <h2 className="text-2xl font-bold mb-10 text-center">📊 Dashboard</h2>
      <nav>
        <ul className="space-y-6">
          <li>
            <Link href="/" className="hover:text-blue-400 block">Home</Link>
          </li>
          <li>
            <Link href="/portfolio" className="hover:text-blue-400 block">Portfolio</Link>
          </li>
          <li>
            <Link href="/watchlist" className="hover:text-blue-400 block">Watchlist</Link>
          </li>
          <li>
            <Link href="/settings" className="hover:text-blue-400 block">Settings</Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar  // <-- This is REQUIRED
