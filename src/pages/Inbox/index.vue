<template>
  <layout>
    <template #header>
      <fragment>
        <span class="text-subtitle1" style="width: 80px">Inbox</span>
        <q-space />
      </fragment>
    </template>
    <template #content>
      <div class="column flex-1">
        <div class="row flex-1">
          <div class="column col-12">
            <inbox />
          </div>
        </div>
      </div>
    </template>
  </layout>
</template>

<script>
import Layout from 'layouts/PrimaryPageLayout'
import Inbox from './Inbox'

export default {
  name: 'InboxPage',
  components: {
    layout: Layout,
    inbox: Inbox
  }
}
</script>

<style>
</style>
