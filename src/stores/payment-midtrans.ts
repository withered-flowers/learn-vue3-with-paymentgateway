// This code will break using TypeScript
// Midtrans SnapJS not provided in npm, so no TS Detection !
import { ref } from 'vue'
import { defineStore } from 'pinia'

// TypeScript Related Type
type JSONResponse<T> = {
  statusCode: number
  error?: string
  data?: T
}

type JSONResponseToken = JSONResponse<{
  token: string
}>

type JSONResponseMessage = JSONResponse<{
  message: string
}>

// https://docs.midtrans.com/reference/js-callback
type SnapObject = {
  status_code: string
  status_message: string
  transaction_id: string
  order_id: string
  gross_amount: string
  payment_type: string
  transaction_status: string
  transaction_time: string

  // For Card Payment
  bank: string
  card_type: string
  finish_redirect_url: string
  fraud_status: string
  masked_card: string
  approval_code: string
}
// End of TypeScript Related Type

// Snap URL to be inserted to script
const snapUrl = 'https://app.sandbox.midtrans.com/snap/snap.js'
const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY

// Server URL to ask for token midtrans
const serverUrl = 'http://localhost:3000/v1/payment/midtrans'

export const usePaymentMidtransStore = defineStore('payment-midtrans', () => {
  // State
  const isPaymentLoading = ref<boolean>(false)
  const isPaymentPending = ref<boolean>(false)
  const isPaymentSuccess = ref<boolean>(false)
  const isPaymentError = ref<boolean>(false)

  const paymentErrorMessage = ref<string | undefined>(undefined)
  const paymentSuccessMessage = ref<string | undefined>(undefined)

  // Midtrans cannot insert script itself
  // So we need to insert it
  const snapScript = ref<HTMLScriptElement | undefined>(undefined)

  // Actions
  const initializeSnap = () => {
    if (snapScript.value === undefined) {
      // Initialize Snap (insert script)
      snapScript.value = document.createElement('script')

      snapScript.value.src = snapUrl
      snapScript.value.setAttribute('data-client-key', clientKey)
      snapScript.value.async = true

      document.body.append(snapScript.value)
    }
  }

  const unsubscribeSnap = () => {
    if (snapScript.value !== undefined) {
      document.body.removeChild(snapScript.value)
      snapScript.value = undefined
    }
  }

  const payMe = async (itemName: string, itemPrice: number) => {
    try {
      initializeState()

      const response = await fetch(`${serverUrl}/payment`, {
        method: 'POST',
        body: JSON.stringify({
          itemName,
          itemPrice
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const responseJson: JSONResponseToken = await response.json()

      if (responseJson.error) {
        throw new Error(responseJson.error)
      }

      if (responseJson.data) {
        // @ts-ignore
        window.snap.pay(responseJson.data.token, {
          onSuccess: payMeCallback,
          onPending: (result: SnapObject) => {
            console.log('Payment is on pending', result)
          },
          onError: (error: unknown) => {
            console.log(error)
          },
          onClose: () => {
            console.log('Snap sucessfully closed')
          }
        })
      }
    } catch (err) {
      isPaymentError.value = true
      if (err instanceof Error) paymentErrorMessage.value = err.message
    } finally {
      isPaymentLoading.value = false
    }
  }

  // Utilities
  const initializeState = () => {
    isPaymentLoading.value = true
    isPaymentPending.value = false
    isPaymentSuccess.value = false
    isPaymentError.value = false

    paymentErrorMessage.value = undefined
    paymentSuccessMessage.value = undefined
  }

  const payMeCallback = async (result: SnapObject) => {
    const response = await fetch(`${serverUrl}/payment-callback`, {
      method: 'POST',
      body: JSON.stringify({
        transactionId: result.order_id
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const responseJson: JSONResponseMessage = await response.json()

    if (responseJson.data) {
      paymentSuccessMessage.value = responseJson.data.message
    }
  }

  // Return value
  return {
    isPaymentLoading,
    isPaymentSuccess,
    isPaymentError,
    paymentErrorMessage,
    paymentSuccessMessage,
    initializeSnap,
    unsubscribeSnap,
    payMe
  }
})
