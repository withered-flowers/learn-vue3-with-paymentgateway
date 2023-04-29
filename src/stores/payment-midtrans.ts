// This code will break using TypeScript
// Midtrans SnapJS not provided in npm, so no TS Detection !
import { ref } from 'vue'
import { defineStore } from 'pinia'

// TypeScript Related Type
type JSONResponse = {
  statusCode: number
  error?: string
  data?: {
    token: string
  }
}

type SnapObject = {
  bank: string
  card_type: string
  finish_redirect_url: string
  fraud_status: string
  gross_amount: string
  masked_card: string
  order_id: string
  payment_type: string
  status_code: string
  status_message: string
  transaction_id: string
  transaction_status: string
  transaction_time: string
}
// End of TypeScript Related Type

// Snap URL to be inserted to script
const snapUrl = 'https://app.sandbox.midtrans.com/snap/snap.js'
const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY

// Server URL to ask for token midtrans
const serverUrl = 'http://localhost:3000/v1/payment/midtrans-payment'

export const usePaymentMidtransStore = defineStore('payment-midtrans', () => {
  // State
  const isPaymentLoading = ref<boolean>(false)
  const isPaymentSuccess = ref<boolean>(false)
  const isPaymentError = ref<boolean>(false)

  const paymentErrorMessage = ref<string | undefined>(undefined)
  const paymentSuccessMessage = ref<string | undefined>(undefined)
  const paymentSuccessId = ref<string | undefined>(undefined)

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
      isPaymentLoading.value = true
      paymentErrorMessage.value = undefined
      paymentSuccessMessage.value = undefined

      const response = await fetch(`${serverUrl}`, {
        method: 'POST',
        body: JSON.stringify({
          itemName,
          itemPrice
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const responseJson: JSONResponse = await response.json()

      if (responseJson.error) {
        throw new Error(responseJson.error)
      }

      if (responseJson.data) {
        // @ts-ignore
        window.snap.pay(responseJson.data.token, {
          onSuccess: (result: SnapObject) => {
            paymentSuccessId.value = result.order_id
            paymentSuccessMessage.value = result.status_message
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

  // Return value
  return {
    isPaymentLoading,
    isPaymentSuccess,
    isPaymentError,
    paymentErrorMessage,
    paymentSuccessMessage,
    paymentSuccessId,
    initializeSnap,
    unsubscribeSnap,
    payMe
  }
})
