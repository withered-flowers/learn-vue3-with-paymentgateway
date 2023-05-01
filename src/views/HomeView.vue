<script setup lang="ts">
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { usePaymentMidtransStore } from '@/stores/payment-midtrans'
import { usePaymentXenditStore } from '@/stores/payment-xendit'
import ItemCard from '../components/ItemCard.vue'

const midtransStore = usePaymentMidtransStore()
const { paymentSuccessMessage, paymentErrorMessage } = storeToRefs(midtransStore)

// Xendit must have redirection with invoice, so now we need to have another control for success / failure redirection from Xendit
const xenditStore = usePaymentXenditStore()
const { paymentSuccessMessage: xenditPaymentSuccessMessage } = storeToRefs(xenditStore)
const { payMeCallback } = xenditStore

const route = useRoute()

// get URLSearchParams from vue router (query)
const query = route.query

// if there is external_id in query, then it means that the payment is from Xendit
if (query.external_id) {
  payMeCallback(query.external_id as string)
}
</script>

<template>
  <main class="p-4 min-w-full min-h-screen">
    <p class="text-3xl mb-4">Coba Pembayaran dengan Payment Gateway Yuk</p>

    <p class="bg-red-200 mb-4 p-4 rounded" v-if="paymentErrorMessage">
      {{ paymentErrorMessage }}
    </p>

    <p
      class="bg-green-200 mb-4 p-4 rounded flex flex-col"
      v-if="paymentSuccessMessage || xenditPaymentSuccessMessage"
    >
      <span>Message From Server:</span>
      <span class="font-semibold">{{ paymentSuccessMessage }}</span>
      <span class="font-semibold">{{ xenditPaymentSuccessMessage }}</span>
    </p>

    <section class="how-to mb-4">
      <p>To try the payment using Midtrans:</p>
      <ul class="ml-6 list-disc">
        <li>Try payment using <span class="font-semibold">Credit Card</span></li>
        <li>Insert Credit Card Number: <span class="font-semibold">4811-1111-1111-1114</span></li>
        <li>
          Insert Expiration Date: <span class="font-semibold">01/&lt;Year More Than Now&gt;</span>
        </li>
        <li>Insert CVV: <span class="font-semibold">123</span></li>
        <li>Password <span class="font-semibold">112233</span></li>
      </ul>
    </section>

    <section class="flex gap-4">
      <ItemCard name="Item 1" :price="250000" />
      <ItemCard name="Item 2" :price="350000" />
      <ItemCard name="Item 3" :price="500000" />
    </section>
  </main>
</template>
