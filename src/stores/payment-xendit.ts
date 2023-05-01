import { ref } from 'vue'
import { defineStore } from 'pinia'

// TypeScript Related Type
type JSONResponse<T> = {
  statusCode: number
  error?: string
  data?: T
}

type JSONResponseData = JSONResponse<{
  id: number
  external_id: number
  user_id: number
  invoice_url: string
}>

type JSONResponseMessage = JSONResponse<{
  message: string
}>
// End of TypeScript Related Type

// Server URL to ask for xendit invoices
const serverUrl = 'http://localhost:3000/v1/payment/xendit'

export const usePaymentXenditStore = defineStore('payment-xendit', () => {
  // State
  const isPaymentLoading = ref<boolean>(false)
  const isPaymentSuccess = ref<boolean>(false)
  const isPaymentError = ref<boolean>(false)

  const paymentErrorMessage = ref<string | undefined>(undefined)
  const paymentSuccessMessage = ref<string | undefined>(undefined)

  // Actions
  const payMe = async (itemName: string, itemPrice: number) => {
    try {
      isPaymentLoading.value = true
      isPaymentError.value = false
      isPaymentSuccess.value = false
      paymentErrorMessage.value = undefined
      paymentSuccessMessage.value = undefined

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

      const responseJson: JSONResponseData = await response.json()

      if (responseJson.error) {
        console.log(responseJson.error)
      }

      if (responseJson.data) {
        // Redirect to new page
        window.location.href = responseJson.data.invoice_url
      }
    } catch (err) {
      isPaymentError.value = true
    } finally {
      isPaymentLoading.value = false
    }
  }

  const payMeCallback = async (invoiceId: string) => {
    // TODO: Check to the server backend that the payment already paid
    const response = await fetch(`${serverUrl}/invoice/${invoiceId}`)
    const responseJson: JSONResponseMessage = await response.json()

    if (responseJson.data) {
      paymentSuccessMessage.value = responseJson.data.message
    }
  }

  // Return Value
  return {
    isPaymentError,
    isPaymentLoading,
    isPaymentSuccess,
    paymentErrorMessage,
    paymentSuccessMessage,
    payMe,
    payMeCallback
  }
})
