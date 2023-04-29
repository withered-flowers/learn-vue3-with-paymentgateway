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

  // Xendit cannot open new window itself
  // So we need to handle the window
  const xenditWindow = ref<Window | null>(null)

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
        xenditWindow.value = window.open(responseJson.data.invoice_url)
        xenditWindow.value?.addEventListener('beforeunload', payMeCallback)
        // xenditWindow.value?.addEventListener('unload', payMeCallback)
      }
    } catch (err) {
      isPaymentError.value = true
    } finally {
      isPaymentLoading.value = false
    }
  }

  const payMeCallback = () => {
    console.log('Callback called and window is closed !')
    if (xenditWindow.value) {
      xenditWindow.value.close()
      xenditWindow.value = null
    }
  }

  // Return Value
  return {
    isPaymentError,
    isPaymentLoading,
    isPaymentSuccess,
    paymentErrorMessage,
    paymentSuccessMessage,
    payMe
  }
})
