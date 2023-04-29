<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import { usePaymentMidtransStore } from './stores/payment-midtrans'

const midtransStore = usePaymentMidtransStore()
const { initializeSnap, unsubscribeSnap } = midtransStore

onMounted(() => {
  initializeSnap()
})

onUnmounted(() => {
  unsubscribeSnap()
})
</script>

<template>
  <RouterView />
</template>
