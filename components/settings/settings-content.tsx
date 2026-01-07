"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { 
  Search, Bell, Plus, User, Sliders, BellRing, CreditCard, 
  Shield, Smartphone, Monitor, X, Calendar
} from "lucide-react"

export function SettingsContent() {
  const [activeTab, setActiveTab] = useState("profile")
  const [selectedRegions, setSelectedRegions] = useState(["Northeast", "Rajasthan"])

  const tabs = [
    { id: "profile", label: "Profile & Identity", icon: User },
    { id: "preferences", label: "Travel Preferences", icon: Sliders },
    { id: "notifications", label: "Notifications", icon: BellRing },
    { id: "payment", label: "Payment & Wallet", icon: CreditCard },
    { id: "security", label: "Security & Privacy", icon: Shield },
    { id: "app", label: "App Experience", icon: Smartphone },
  ]

  const personalityPresets = [
    { id: "mountain", label: "Mountain Soul", icon: "🏔️" },
    { id: "beach", label: "Beach Bum", icon: "🏖️" },
    { id: "heritage", label: "Heritage Hunter", icon: "🏛️" },
    { id: "food", label: "Food Pilgrim", icon: "🍜" },
    { id: "offbeat", label: "Offbeat Explorer", icon: "🧭" },
  ]

  const notificationTypes = [
    { id: "price-drops", label: "Price drops on wishlist", push: true, email: false, never: false },
    { id: "hidden-gems", label: "New hidden gems nearby", push: false, email: true, never: false },
    { id: "festivals", label: "Festival & long-weekend suggestions", push: true, email: false, never: false },
    { id: "memories", label: '"On This Day" memories', push: false, email: false, never: true },
  ]

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search settings..." 
                className="pl-10 pr-16 bg-gray-50 border-gray-200"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-white border border-gray-200 rounded">
                ⌘K
              </kbd>
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            
            <Button className="bg-black hover:bg-gray-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Trip
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account and preferences</p>
          </div>

          <div className="flex gap-6">
            {/* Sidebar Navigation */}
            <div className="w-64 flex-shrink-0">
              <Card className="p-2">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? "bg-gray-900 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-6">
              {activeTab === "profile" && (
                <>
                  {/* Travel DNA Card */}
                  <Card className="p-6">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                          <div className="text-center text-white">
                            <p className="text-xs font-medium">Visual Radar Chart of</p>
                            <p className="text-xs font-medium">Travel DNA</p>
                          </div>
                        </div>
                        <div className="text-center mt-3">
                          <p className="text-sm font-semibold text-gray-900">Your Personal Travel DNA™</p>
                          <p className="text-xs text-gray-500">You're 78% Hidden-Gem Seeker • 64% Mountain Lover</p>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-3">One-Click Personality Presets</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {personalityPresets.map((preset) => (
                            <Button
                              key={preset.id}
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              <span>{preset.icon}</span>
                              {preset.label}
                            </Button>
                          ))}
                        </div>

                        <Card className="p-4 bg-gray-50 border-gray-200">
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16">
                              <svg className="w-16 h-16 transform -rotate-90">
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  stroke="#e5e7eb"
                                  strokeWidth="8"
                                  fill="none"
                                />
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  stroke="#10b981"
                                  strokeWidth="8"
                                  fill="none"
                                  strokeDasharray={`${83 * 1.76} ${100 * 1.76}`}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-bold">83%</span>
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Recommendation Accuracy Score</p>
                              <p className="text-sm text-gray-600">Rate more trips to improve your score and unlock rewards!</p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </Card>

                  {/* Profile & Identity */}
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Profile & Identity</h3>
                    <p className="text-sm text-gray-600 mb-6">Update your personal information and photo.</p>

                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-10 h-10 text-gray-400" />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="default" size="sm">Change Photo</Button>
                        <Button variant="outline" size="sm">Remove</Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="fullname">Full Name</Label>
                        <Input id="fullname" defaultValue="Rohan Sharma" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="birthday">Birthday</Label>
                        <div className="relative mt-1">
                          <Input id="birthday" defaultValue="15-08-1995" />
                          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="voucher-name">Preferred Name on Vouchers</Label>
                      <Input id="voucher-name" defaultValue="Rohan" className="mt-1" />
                    </div>

                    <div>
                      <Label htmlFor="bio">Travel Bio</Label>
                      <Textarea 
                        id="bio" 
                        defaultValue="Chasing sunsets & momos in the Himalayas"
                        className="mt-1 min-h-[100px]"
                      />
                    </div>
                  </Card>
                </>
              )}

              {activeTab === "preferences" && (
                <>
                  {/* Travel Preferences */}
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Travel Preferences</h3>
                    <p className="text-sm text-gray-600 mb-6">Tell us your style. This helps us find the perfect trips for you</p>

                    <div className="space-y-6">
                      <div>
                        <Label className="text-base font-semibold mb-3 block">Favorite regions in India</Label>
                        <div className="flex flex-wrap gap-2">
                          {["Northeast", "Rajasthan", "Kerala Backwaters", "Himalayas"].map((region) => (
                            <Badge
                              key={region}
                              variant={selectedRegions.includes(region) ? "default" : "outline"}
                              className={`cursor-pointer ${
                                selectedRegions.includes(region)
                                  ? "bg-black text-white"
                                  : "hover:bg-gray-100"
                              }`}
                              onClick={() => {
                                if (selectedRegions.includes(region)) {
                                  setSelectedRegions(selectedRegions.filter((r) => r !== region))
                                } else {
                                  setSelectedRegions([...selectedRegions, region])
                                }
                              }}
                            >
                              {region}
                              {selectedRegions.includes(region) && (
                                <X className="w-3 h-3 ml-1" />
                              )}
                            </Badge>
                          ))}
                          <Button variant="outline" size="sm">+ Add Region</Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-semibold mb-3 block">Hidden-Gem Intensity</Label>
                        <div className="relative pt-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            defaultValue="75"
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>Show me only mainstream</span>
                            <span>Take me where no one goes</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-semibold mb-3 block">Travel Pace</Label>
                        <div className="grid grid-cols-3 gap-3">
                          {["Chill", "Balanced", "Packed"].map((pace, idx) => (
                            <Button
                              key={pace}
                              variant={idx === 1 ? "default" : "outline"}
                              className={idx === 1 ? "bg-black hover:bg-gray-800" : ""}
                            >
                              {pace}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </>
              )}

              {activeTab === "notifications" && (
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Notification Preferences</h3>
                  <p className="text-sm text-gray-600 mb-6">Control how and when we contact you. We'll still send critical alerts</p>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">TYPE</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">PUSH</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">EMAIL</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">NEVER</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notificationTypes.map((type) => (
                          <tr key={type.id} className="border-b border-gray-100">
                            <td className="py-4 px-4 text-sm text-gray-900">{type.label}</td>
                            <td className="py-4 px-4 text-center">
                              <input
                                type="radio"
                                name={type.id}
                                defaultChecked={type.push}
                                className="w-4 h-4 accent-green-600"
                              />
                            </td>
                            <td className="py-4 px-4 text-center">
                              <input
                                type="radio"
                                name={type.id}
                                defaultChecked={type.email}
                                className="w-4 h-4 accent-green-600"
                              />
                            </td>
                            <td className="py-4 px-4 text-center">
                              <input
                                type="radio"
                                name={type.id}
                                defaultChecked={type.never}
                                className="w-4 h-4 accent-green-600"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {activeTab === "security" && (
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Security & Logout</h3>
                  <p className="text-sm text-gray-600 mb-6">Manage your password, active sessions, and account data</p>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">Change Password</p>
                        <p className="text-sm text-gray-600">Set a new password for your account</p>
                      </div>
                      <Button variant="outline">Change</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">Fingerprint/Face ID</p>
                        <p className="text-sm text-gray-600">Enable biometric login for faster access</p>
                      </div>
                      <Switch />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900 mb-3">Active Sessions</p>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Monitor className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">Chrome on macOS</p>
                            <p className="text-sm text-gray-600">New Delhi, IN • Current session</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">Log out</Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <Button variant="default" className="bg-black hover:bg-gray-800">
                        Log Out
                      </Button>
                      <Button variant="link" className="text-gray-600">
                        Log out from all devices
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
