<template>
  <primary-page-layout>
    <template #header>
      <contact-header />
    </template>
    <template #content>
      <router-view />
    </template>
  </primary-page-layout>
</template>

<script>
import PrimaryPageLayout from './PrimaryPageLayout'
import ContactHeader from '../pages/Contacts/ContactHeader'

export default {
  name: 'DealPrimaryLayout',
  components: {
    'contact-header': ContactHeader,
    'primary-page-layout': PrimaryPageLayout
  }
}
</script>

<style>
</style>
