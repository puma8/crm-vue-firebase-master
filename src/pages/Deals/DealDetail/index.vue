<template>
  <div class="column flex-1">
    <div class="row flex-1">
      <deal-info class="col-4" />
      <deal-activity class="col-8" />
    </div>
  </div>
</template>

<script>
import DealInfo from './DealInfo'
import DealActivity from './DealActivity'

export default {
  name: 'Deal',
  components: {
    'deal-info': DealInfo,
    'deal-activity': DealActivity
  }
}
</script>
