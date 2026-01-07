"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  Lock, 
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react"
import { paymentService } from "@/lib/services/payment"

interface PaymentFormProps {
  bookingId: string
  amount: number
  currency?: string
  onSuccess?: (result: any) => void
  onError?: (error: string) => void
}

export function PaymentForm({ 
  bookingId, 
  amount, 
  currency = "inr", 
  onSuccess, 
  onError 
}: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<"card" | "upi" | "netbanking" | "wallet">("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Card form state
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  })

  // UPI form state
  const [upiId, setUpiId] = useState("")

  // Netbanking form state
  const [selectedBank, setSelectedBank] = useState("")

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    setPaymentStatus("processing")
    setErrorMessage(null)

    try {
      // Create payment intent
      const paymentIntent = await paymentService.createPaymentIntent(
        amount,
        currency,
        bookingId,
        { payment_method: selectedMethod }
      )

      // Simulate payment processing (in real implementation, integrate with payment gateway)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Confirm payment
      const result = await paymentService.confirmPayment(
        paymentIntent.id,
        `pm_${selectedMethod}_${Date.now()}`
      )

      if (result.success) {
        setPaymentStatus("success")
        onSuccess?.(result)
      } else {
        throw new Error(result.error || "Payment failed")
      }
    } catch (error: any) {
      setPaymentStatus("error")
      setErrorMessage(error.message)
      onError?.(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const paymentMethods = [
    { id: "card", label: "Credit/Debit Card", icon: CreditCard },
    { id: "upi", label: "UPI", icon: Smartphone },
    { id: "netbanking", label: "Net Banking", icon: Building2 },
    { id: "wallet", label: "Digital Wallet", icon: Wallet },
  ]

  if (paymentStatus === "success") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground mb-4">
              Your payment of {formatAmount(amount)} has been processed successfully.
            </p>
            <Badge variant="secondary" className="mb-4">
              Booking Confirmed
            </Badge>
            <p className="text-sm text-muted-foreground">
              You will receive a confirmation email shortly.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Secure Payment
        </CardTitle>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Amount to pay:</span>
          <span className="text-lg font-semibold">{formatAmount(amount)}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {paymentStatus === "error" && (
          <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Payment Method Selection */}
        <Tabs value={selectedMethod} onValueChange={(v) => setSelectedMethod(v as any)}>
          <TabsList className="grid w-full grid-cols-2 gap-1">
            {paymentMethods.map((method) => {
              const Icon = method.icon
              return (
                <TabsTrigger 
                  key={method.id} 
                  value={method.id}
                  className="flex items-center gap-2 text-xs"
                >
                  <Icon className="w-4 h-4" />
                  {method.label}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Card Payment */}
          <TabsContent value="card" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardData.number}
                onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                disabled={isProcessing}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={cardData.expiry}
                  onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                  disabled={isProcessing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                  disabled={isProcessing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                placeholder="John Doe"
                value={cardData.name}
                onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                disabled={isProcessing}
              />
            </div>
          </TabsContent>

          {/* UPI Payment */}
          <TabsContent value="upi" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upiId">UPI ID</Label>
              <Input
                id="upiId"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Enter your UPI ID to complete the payment
            </div>
          </TabsContent>

          {/* Net Banking */}
          <TabsContent value="netbanking" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank">Select Bank</Label>
              <select
                id="bank"
                className="w-full p-2 border border-gray-200 rounded-md"
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                disabled={isProcessing}
              >
                <option value="">Choose your bank</option>
                <option value="sbi">State Bank of India</option>
                <option value="hdfc">HDFC Bank</option>
                <option value="icici">ICICI Bank</option>
                <option value="axis">Axis Bank</option>
                <option value="kotak">Kotak Mahindra Bank</option>
              </select>
            </div>
          </TabsContent>

          {/* Digital Wallet */}
          <TabsContent value="wallet" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {["Paytm", "PhonePe", "Google Pay", "Amazon Pay"].map((wallet) => (
                <Button
                  key={wallet}
                  variant="outline"
                  className="h-12"
                  disabled={isProcessing}
                >
                  {wallet}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Payment Button */}
        <Button 
          onClick={handlePayment} 
          className="w-full" 
          disabled={isProcessing}
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Pay {formatAmount(amount)}
            </>
          )}
        </Button>

        {/* Security Notice */}
        <div className="text-xs text-muted-foreground text-center">
          <Lock className="w-3 h-3 inline mr-1" />
          Your payment information is encrypted and secure
        </div>
      </CardContent>
    </Card>
  )
}