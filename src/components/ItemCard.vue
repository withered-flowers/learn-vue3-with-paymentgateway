<script setup lang="ts">
import { usePaymentMidtransStore } from '@/stores/payment-midtrans'
import { usePaymentXenditStore } from '@/stores/payment-xendit'

defineProps<{
  name: string
  price: number
}>()

const midtransStore = usePaymentMidtransStore()
const xenditStore = usePaymentXenditStore()

const { payMe: payMeMidtrans } = midtransStore
const { payMe: payMeXendit } = xenditStore
</script>

<template>
  <section class="card bg-gray-200 flex flex-col gap-2 p-4 rounded">
    <p class="text-xl">{{ name }}</p>
    <p>Harga: Rp. {{ price.toLocaleString('id-ID') }},00</p>
    <button
      class="py-2 px-4 bg-blue-200 rounded hover:bg-blue-400 hover:text-white transition-colors duration-300"
      @click="payMeMidtrans(name, price)"
    >
      Buy (Midtrans)
    </button>
    <button
      class="py-2 px-4 bg-blue-200 rounded hover:bg-blue-400 hover:text-white transition-colors duration-300"
      @click="payMeXendit(name, price)"
    >
      Buy (Xendit)
    </button>
  </section>
</template>
