"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function SearchFilters() {
  const [priceRange, setPriceRange] = useState([0, 5000])

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-serif text-lg font-bold text-[#2c4c3b]">Filters</h3>
        <Button variant="ghost" size="sm" className="text-sm text-gray-500 hover:text-[#e87c57]">
          Reset
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["price", "difficulty", "region"]} className="w-full">
        <AccordionItem value="price" className="border-b-gray-100">
          <AccordionTrigger className="text-[#2c4c3b] hover:no-underline">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="px-2 py-4">
              <Slider
                defaultValue={[0, 5000]}
                max={10000}
                step={100}
                value={priceRange}
                onValueChange={setPriceRange}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}+</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="difficulty" className="border-b-gray-100">
          <AccordionTrigger className="text-[#2c4c3b] hover:no-underline">Difficulty Level</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {["Easy (Relaxed)", "Moderate (Active)", "Challenging (Hike)", "Expert (Trek)"].map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox id={level} />
                  <Label htmlFor={level} className="text-sm font-normal text-gray-600 cursor-pointer">
                    {level}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="region" className="border-b-gray-100">
          <AccordionTrigger className="text-[#2c4c3b] hover:no-underline">Region</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {["Japan", "Europe", "Asia Pacific", "Americas"].map((region) => (
                <div key={region} className="flex items-center space-x-2">
                  <Checkbox id={region} />
                  <Label htmlFor={region} className="text-sm font-normal text-gray-600 cursor-pointer">
                    {region}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="features" className="border-none">
          <AccordionTrigger className="text-[#2c4c3b] hover:no-underline">Features</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {["Nature Focused", "Historical", "Coastal", "Mountain", "Food & Drink"].map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox id={feature} />
                  <Label htmlFor={feature} className="text-sm font-normal text-gray-600 cursor-pointer">
                    {feature}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button className="w-full mt-6 bg-[#2c4c3b] hover:bg-[#1a3326] text-white">Apply Filters</Button>
    </div>
  )
}
