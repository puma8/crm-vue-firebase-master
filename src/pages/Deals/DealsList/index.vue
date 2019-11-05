<template>
  <fragment>
    <deals-kanban v-if="viewMode === 'kanban'" :board="board" />
    <deals-list v-if="viewMode === 'list'" :board="board" />
  </fragment>
</template>

<script>
import DealsKanban from './DealsKanban'
import DealsList from './DealsList'
import { dealsRouteValidation } from 'src/router/validations'

export default {
  name: 'DealsLayout',
  props: ['board', 'viewMode'],
  components: {
    'deals-kanban': DealsKanban,
    'deals-list': DealsList
  },
  beforeRouteUpdate: dealsRouteValidation
}
</script>

<style>
</style>
