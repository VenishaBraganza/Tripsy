'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, MapPin, Users, Clock, Plane, Hotel, 
  Mountain, Search, Filter, Download, Share2, 
  MoreHorizontal, Edit, Trash2, Star, ArrowRight
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { format, differenceInDays } from "date-fns"
import { dummyTrips, dummyBookings, dummyPackages } from "@/lib/data/dummy-data"

export function MyTripsContentPrototype() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState("upcoming")
  
  const upcomingTrips = dummyTrips.filter(trip => trip.status === 'upcoming')
  const completedTrips = dummyTrips.filter(trip => trip.status === 'completed')
  const allTrips = dummyTrips

  const getTripsForTab = 