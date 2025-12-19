import React from 'react'

const Header = () => {
  return (
    <div className="w-full h-12 flex items-center justify-between px-4 bg-gray-800 text-white">
      <div className="text-lg font-bold">HyperDash</div>
      <div className="flex items-center space-x-4">
        <span className="px-2 py-1 bg-red-600 rounded text-sm">PROD</span>
        <span className="text-sm">Region: BLR</span>
      </div>
    </div>
  )
}

export default Header