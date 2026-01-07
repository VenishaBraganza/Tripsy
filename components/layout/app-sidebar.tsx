"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Plane, Star, MapPin, LogOut, ChevronDown, ChevronRight
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { LogoutButton } from "@/components/auth/logout-button"

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [travelerDashboardOpen, setTravelerDashboardOpen] = useState(true)
  const [operatorToolsOpen, setOperatorToolsOpen] = useState(false)



  const isActive = (path: string) => pathname === path

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo Header */}
      <div className="p-6 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-gray-900">Tripsy</h1>
            <p className="text-xs text-gray-500">Explore South Karnataka</p>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 space-y-1">
          {/* Platform Label */}
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Platform</p>
          </div>

          {/* Traveler Dashboard Section */}
          <div>
            <button
              onClick={() => setTravelerDashboardOpen(!travelerDashboardOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Traveler Dashboard
              </span>
              {travelerDashboardOpen ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
            
            {travelerDashboardOpen && (
              <div className="mt-1 ml-6 space-y-0.5 border-l-2 border-gray-100 pl-3">
                <Link 
                  href="/dashboard" 
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive('/dashboard') 
                      ? 'bg-teal-50 text-teal-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive('/dashboard') && <div className="w-1.5 h-1.5 bg-teal-600 rounded-full -ml-5" />}
                  Overview
                </Link>
                
                <Link 
                  href="/dashboard/my-trips" 
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive('/dashboard/my-trips') 
                      ? 'bg-teal-50 text-teal-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Plane className="w-4 h-4" />
                  My Trips
                </Link>
                
                <Link 
                  href="/dashboard/bookings" 
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive('/dashboard/bookings') 
                      ? 'bg-teal-50 text-teal-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Bookings
                </Link>
                
                <Link 
                  href="/dashboard/wishlist" 
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive('/dashboard/wishlist') 
                      ? 'bg-teal-50 text-teal-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  Wishlist
                </Link>
                
                <Link 
                  href="/dashboard/history" 
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive('/dashboard/history') 
                      ? 'bg-teal-50 text-teal-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  History
                </Link>
              </div>
            )}
          </div>

          {/* Operator Tools Section */}
          <div className="mt-1">
            <button
              onClick={() => setOperatorToolsOpen(!operatorToolsOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Operator Tools
              </span>
              {operatorToolsOpen ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
            
            {operatorToolsOpen && (
              <div className="mt-1 ml-6 space-y-0.5 border-l-2 border-gray-100 pl-3">
                <Link 
                  href="/dashboard/manage-packages" 
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive('/dashboard/manage-packages') 
                      ? 'bg-teal-50 text-teal-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Manage Packages
                </Link>
              </div>
            )}
          </div>

          {/* Quick Links Section */}
          <div className="pt-4 mt-4 border-t border-gray-100">
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Links</p>
            </div>
            
            <Link 
              href="/explore" 
              className={`flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                isActive('/explore') 
                  ? 'bg-teal-50 text-teal-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Explore
            </Link>
            
            <Link 
              href="/support" 
              className={`flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                isActive('/support') 
                  ? 'bg-teal-50 text-teal-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Support
            </Link>
            
            <Link 
              href="/settings" 
              className={`flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                isActive('/settings') 
                  ? 'bg-teal-50 text-teal-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
          </div>
        </div>
      </div>

      {/* User Profile Footer - Fixed at bottom */}
      <div className="p-4 border-t border-gray-100 flex-shrink-0 bg-white">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer mb-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
            CO
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">Chihiro Ogino</p>
            <p className="text-xs text-gray-500 truncate">chihiro@bathhouse.com</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </Button>
        </div>
        <LogoutButton 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors text-sm h-9"
        />
      </div>
    </aside>
  )
}
