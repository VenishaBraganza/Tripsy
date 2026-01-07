"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import type { TourPackage } from "@/lib/types/database"
import { cn } from "@/lib/utils"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const bookingSchema = z.object({
  travelers: z.coerce.number().min(1, "At least 1 traveler is required").max(20, "Max 20 travelers allowed"),
  date: z.date({
    required_error: "Please select a date",
  }),
  specialRequests: z.string().optional(),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
})

type BookingFormValues = z.infer<typeof bookingSchema>

function CheckoutForm({
  packageData,
  formData,
  clientSecret,
}: {
  packageData: TourPackage
  formData: BookingFormValues
  clientSecret: string
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setIsLoading(true)

    const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    })

    if (paymentError) {
      toast.error(paymentError.message)
      setIsLoading(false)
      return
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      // Create booking record in Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error("You must be logged in to complete booking")
        setIsLoading(false)
        return
      }

      const { error: bookingError } = await supabase.from("bookings").insert({
        user_id: user.id,
        package_id: packageData.id,
        booking_reference: `GB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        traveler_count: formData.travelers,
        start_date: formData.date.toISOString(),
        end_date: new Date(formData.date.getTime() + packageData.duration_days * 24 * 60 * 60 * 1000).toISOString(),
        total_amount: packageData.price_per_person * formData.travelers,
        payment_status: "paid",
        booking_status: "confirmed",
        special_requests: formData.specialRequests,
        payment_id: paymentIntent.id,
        traveler_details: [
          {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
          },
        ],
      })

      if (bookingError) {
        console.error("Booking Error:", bookingError)
        toast.error("Payment successful but failed to create booking record. Please contact support.")
      } else {
        toast.success("Booking confirmed! Get ready for your adventure.")
        router.push("/dashboard/trips")
      }
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-[#2c4c3b] hover:bg-[#1a3326] text-white h-12 text-lg font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${(packageData.price_per_person * formData.travelers).toLocaleString()}`
        )}
      </Button>
    </form>
  )
}

export default function BookingForm({ tourPackage }: { tourPackage: TourPackage }) {
  const [step, setStep] = useState<"details" | "payment">("details")
  const [clientSecret, setClientSecret] = useState<string>("")
  const [formData, setFormData] = useState<BookingFormValues | null>(null)

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      travelers: 1,
      specialRequests: "",
    },
  })

  async function onSubmit(data: BookingFormValues) {
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: tourPackage.id,
          travelers: data.travelers,
          totalAmount: tourPackage.price_per_person * data.travelers,
          date: data.date,
        }),
      })

      if (!response.ok) throw new Error("Failed to initialize payment")

      const { clientSecret } = await response.json()
      setClientSecret(clientSecret)
      setFormData(data)
      setStep("payment")
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="text-2xl font-serif font-bold text-[#2c4c3b] mb-2">
          {step === "details" ? "Book Your Journey" : "Complete Payment"}
        </h3>
        <p className="text-gray-500 text-sm">
          {step === "details" ? "Fill in your details to start your adventure." : "Secure payment powered by Stripe."}
        </p>
      </div>

      {step === "details" ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Chihiro Ogino" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="chihiro@bathhouse.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="travelers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Travelers</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={20} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Travel Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requests (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Dietary restrictions, accessibility needs, etc."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-[#f7f9f5] p-4 rounded-lg">
              <div className="flex justify-between mb-2 text-sm">
                <span>Price per person</span>
                <span>${tourPackage.price_per_person.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-[#2c4c3b] text-lg pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>${(tourPackage.price_per_person * (form.watch("travelers") || 1)).toLocaleString()}</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#e87c57] hover:bg-[#d66a45] text-white h-12 text-lg font-semibold"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Proceed to Payment"}
            </Button>
          </form>
        </Form>
      ) : (
        clientSecret &&
        formData && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm packageData={tourPackage} formData={formData} clientSecret={clientSecret} />
            <Button variant="ghost" className="w-full mt-4" onClick={() => setStep("details")}>
              Back to Details
            </Button>
          </Elements>
        )
      )}
    </div>
  )
}
