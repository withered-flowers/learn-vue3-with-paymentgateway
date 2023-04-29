<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { usePaymentMidtransStore } from '@/stores/payment-midtrans'
import ItemCard from '../components/ItemCard.vue'

const midtransStore = usePaymentMidtransStore()
const { paymentSuccessId, paymentSuccessMessage, paymentErrorMessage } = storeToRefs(midtransStore)
</script>

<template>
  <main class="p-4 min-w-full min-h-screen">
    <p class="text-3xl mb-4">Coba Pembayaran dengan Payment Gateway Yuk</p>

    <p class="bg-red-200 mb-4 p-4" v-if="paymentErrorMessage">
      {{ paymentErrorMessage }}
    </p>

    <p class="bg-green-200 mb-4 p-4" v-if="paymentSuccessMessage">
      Payment dengan id {{ paymentSuccessId }} berhasil !
    </p>

    <section class="flex gap-4">
      <ItemCard name="Item 1" :price="500000" />
      <ItemCard name="Item 2" :price="250000" />
      <ItemCard name="Item 3" :price="350000" />
    </section>
  </main>
</template>
