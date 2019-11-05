<template>
  <fragment>
    <people-list v-if="type === 'people'" />
    <company-list v-if="type === 'company'" />
  </fragment>
</template>

<script>
import PeopleList from './PeopleList'
import CompaniesList from './CompaniesList'
import { contactsRouteValidation } from 'src/router/validations'

export default {
  name: 'DealsLayout',
  props: ['type'],
  components: {
    'people-list': PeopleList,
    'company-list': CompaniesList
  },
  beforeRouteUpdate: contactsRouteValidation
}
</script>

<style>
</style>
