<template>
  <fragment>
    <q-tabs shrink v-model="currentTab">
      <q-tab name="people" :label="`People (${people.length})`"
        @click="$router.push({
          name: 'contacts',
          query: {
            type: 'people'
          }
        })"
      />
      <q-tab name="company" :label="`Companies (${companies.length})`"
        @click="$router.push({
          name: 'contacts',
          query: {
            type: 'company'
          }
        })"
      />
    </q-tabs>
    <q-separator vertical />
    <q-input borderless v-model="text" dense>
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>
    <q-space />
  </fragment>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ContactsHeader',
  props: ['type'],
  data () {
    return {
      text: '',
      currentTab: this.type
    }
  },
  computed: {
    ...mapGetters({
      people: 'people/list',
      companies: 'companies/list'
    })
  }
}
</script>

<style>

</style>
