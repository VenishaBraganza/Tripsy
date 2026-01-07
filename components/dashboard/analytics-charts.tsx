"use client"

import React from "react"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Label, Pie, PieChart, XAxis } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Revenue Data
const revenueData = [
  { month: "January", revenue: 12500 },
  { month: "February", revenue: 15800 },
  { month: "March", revenue: 14200 },
  { month: "April", revenue: 21000 },
  { month: "May", revenue: 24500 },
  { month: "June", revenue: 28900 },
]

const revenueConfig = {
  revenue: {
    label: "Revenue ($)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function RevenueChart() {
  return (
    <Card className="col-span-4 border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-[#2c4c3b] font-serif">Revenue Growth</CardTitle>
        <CardDescription>Monthly revenue for the first half of the year</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={revenueConfig} className="h-[300px] w-full">
          <AreaChart
            accessibilityLayer
            data={revenueData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area dataKey="revenue" type="natural" fill="#e87c57" fillOpacity={0.2} stroke="#e87c57" stackId="a" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 15.2% this month <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">January - June 2024</div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

// Bookings by Destination
const destinationData = [
  { destination: "Mystical Forest", bookings: 275, fill: "var(--color-forest)" },
  { destination: "Floating Islands", bookings: 200, fill: "var(--color-islands)" },
  { destination: "Seaside Town", bookings: 187, fill: "var(--color-seaside)" },
  { destination: "Spirit Railway", bookings: 173, fill: "var(--color-railway)" },
  { destination: "Other", bookings: 90, fill: "var(--color-other)" },
]

const destinationConfig = {
  bookings: {
    label: "Bookings",
  },
  forest: {
    label: "Mystical Forest",
    color: "#2c4c3b",
  },
  islands: {
    label: "Floating Islands",
    color: "#e87c57",
  },
  seaside: {
    label: "Seaside Town",
    color: "#4a90e2",
  },
  railway: {
    label: "Spirit Railway",
    color: "#f4a261",
  },
  other: {
    label: "Other",
    color: "#a8a29e",
  },
} satisfies ChartConfig

export function DestinationChart() {
  const totalBookings = React.useMemo(() => {
    return destinationData.reduce((acc, curr) => acc + curr.bookings, 0)
  }, [])

  return (
    <Card className="col-span-3 border-none shadow-sm flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-[#2c4c3b] font-serif">Popular Destinations</CardTitle>
        <CardDescription>Total bookings distribution</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={destinationConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={destinationData} dataKey="bookings" nameKey="destination" innerRadius={60} strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {totalBookings.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                          Bookings
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="destination" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Mystical Forest is top trending <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div className="leading-none text-muted-foreground">Based on last 6 months data</div>
      </CardFooter>
    </Card>
  )
}

// Customer Satisfaction
const satisfactionData = [
  { month: "Jan", rating: 4.2 },
  { month: "Feb", rating: 4.4 },
  { month: "Mar", rating: 4.3 },
  { month: "Apr", rating: 4.6 },
  { month: "May", rating: 4.7 },
  { month: "Jun", rating: 4.8 },
]

const satisfactionConfig = {
  rating: {
    label: "Avg Rating",
    color: "#2c4c3b",
  },
} satisfies ChartConfig

export function SatisfactionChart() {
  return (
    <Card className="col-span-4 lg:col-span-7 border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-[#2c4c3b] font-serif">Customer Satisfaction</CardTitle>
        <CardDescription>Average user ratings over time (Scale 1-5)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={satisfactionConfig} className="h-[200px] w-full">
          <BarChart accessibilityLayer data={satisfactionData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 5]} hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Bar dataKey="rating" layout="vertical" fill="#2c4c3b" radius={4}>
              <Label position="right" offset={10} className="fill-foreground" fontSize={12} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
