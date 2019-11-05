<template>
  <primary-page-layout>
    <template #header>
      <deals-header />
    </template>
    <template #content>
      <router-view />
    </template>
  </primary-page-layout>
</template>

<script>
import PrimaryPageLayout from './PrimaryPageLayout'
import DealsHeader from '../pages/Deals/DealHeader'

export default {
  name: 'DealPrimaryLayout',
  components: {
    'deals-header': DealsHeader,
    'primary-page-layout': PrimaryPageLayout
  }
}
</script>

<style>
</style>
