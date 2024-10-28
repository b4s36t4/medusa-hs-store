import { Cart } from "@medusajs/medusa"
import React, { useState, useEffect, useMemo, useCallback } from "react"
// @ts-ignore
import { loadHyper } from "@juspay-tech/hyper-js"
// @ts-ignore
import { useHyper, useWidgets } from "@juspay-tech/react-hyper-js"
import { Button } from "@medusajs/ui"

interface Props {
  cart: Omit<Cart, "refundable_amount" | "refunded_total">
  notReady: boolean
  "data-testid"?: string
}

export const HyperswitchPaymentButton = ({ cart, notReady }: Props) => {
  const [loading, setIsLoading] = useState(false)

  const hyper = useHyper()
  const elements = useWidgets()

  const clientSecret = useMemo(() => {
    return cart.payment_session?.data?.client_secret
  }, [cart])

  const onSubmit = useCallback(async () => {
    if (!elements || !hyper || !clientSecret) {
      return
    }
    const card = elements.getElement?.("card")
    setIsLoading(true)
    console.log(hyper)
    await hyper
      .confirmCardPayment(clientSecret as string, {
        payment_method: {
          card: card,
          billing_details: {
            name:
              cart.billing_address.first_name +
              " " +
              cart.billing_address.last_name,
            address: {
              city: cart.billing_address.city ?? undefined,
              country: cart.billing_address.country_code ?? undefined,
              line1: cart.billing_address.address_1 ?? undefined,
              line2: cart.billing_address.address_2 ?? undefined,
              postal_code: cart.billing_address.postal_code ?? undefined,
              state: cart.billing_address.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billing_address.phone ?? undefined,
          },
        },
      })
      .then(({ error, paymentIntent }: { error: any; paymentIntent: any }) => {
        console.log(error, paymentIntent, "det")
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            console.log("Payment COmpleted")
            setIsLoading(false)
          }

          // setErrorMessage(error.message || null)
          return
        }

        if (
          (paymentIntent && paymentIntent.status === "requires_capture") ||
          paymentIntent.status === "succeeded"
        ) {
          console.log("Payment COmpleted")
          setIsLoading(false)

          // return onPaymentCompleted()
        }

        return
      })
  }, [
    cart.billing_address.address_1,
    cart.billing_address.address_2,
    cart.billing_address.city,
    cart.billing_address.country_code,
    cart.billing_address.first_name,
    cart.billing_address.last_name,
    cart.billing_address.phone,
    cart.billing_address.postal_code,
    cart.billing_address.province,
    cart.email,
    clientSecret,
    elements,
    hyper,
  ])

  return (
    <>
      {clientSecret ? (
        <Button onClick={onSubmit} disabled={notReady || loading}>
          Continue Payment
        </Button>
      ) : (
        <p>Not a valid Payment, try again!</p>
      )}
    </>
  )
}
