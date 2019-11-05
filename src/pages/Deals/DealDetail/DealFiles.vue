<template>
  <div>
    <div class="row q-gutter-x-md items-center" v-if="deal.googleFolder">
      <span>{{deal.googleFolder.name}}</span>
      <q-btn type='a' target='_blank' icon="call_made" :href="deal.googleFolder.webViewLink" size="sm" flat dense />
    </div>
    <div v-else>
      No files found
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'DealFilesInfo',
  computed: {
    ...mapGetters({
      dealById: 'deals/dealById'
    }),
    deal () {
      return this.dealById(this.$route.params.id)
    }
  }
}
</script>

<style>

</style>
