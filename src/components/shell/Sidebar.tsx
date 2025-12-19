import React from 'react'
const Sidebar = () => {
  return (
    <div className="w-48 h-screen bg-gray-900 text-white flex flex-col p-4 space-y-4">
      <div className="text-lg font-bold mb-8">Menu</div>
      <div className="hover:bg-gray-700 px-2 py-1 rounded cursor-pointer">Dashboard</div>
      <div className="hover:bg-gray-700 px-2 py-1 rounded cursor-pointer">Metrics</div>
      <div className="hover:bg-gray-700 px-2 py-1 rounded cursor-pointer">Logs</div>
      <div className="hover:bg-gray-700 px-2 py-1 rounded cursor-pointer">Performance</div>
    </div>
  )
}

export default Sidebar