// Centralized navigation utilities

export const routes = {
  // Public routes
  home: '/',
  login: '/login',
  signup: '/signup',
  explore: '/explore',
  stories: '/stories',
  journal: '/journal',
  hiddenGems: '/hidden-gems',
  
  // Dashboard routes
  dashboard: '/dashboard',
  myTrips: '/dashboard/my-trips',
  bookings: '/dashboard/bookings',
  wishlist: '/dashboard/wishlist',
  history: '/dashboard/history',
  
  // Admin routes
  managePackages: '/dashboard/manage-packages',
  
  // Support & Settings
  support: '/support',
  settings: '/settings',
  
  // Dynamic routes
  packageDetail: (slug: string) => `/packages/${slug}`,
  destinationDetail: (slug: string) => `/destinations/${slug}`,
  tripDetail: (id: string) => `/dashboard/trips/${id}`,
  bookingDetail: (id: string) => `/dashboard/bookings/${id}`,
  ticketDetail: (id: string) => `/support/tickets/${id}`,
} as const

export function navigateTo(path: string) {
  if (typeof window !== 'undefined') {
    window.location.href = path
  }
}

export function openInNewTab(path: string) {
  if (typeof window !== 'undefined') {
    window.open(path, '_blank', 'noopener,noreferrer')
  }
}

export function goBack() {
  if (typeof window !== 'undefined') {
    window.history.back()
  }
}

export function downloadFile(url: string, filename: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function shareLink(url: string, title: string) {
  if (navigator.share) {
    navigator.share({
      title,
      url,
    }).catch(console.error)
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(url)
    alert('Link copied to clipboard!')
  }
}
