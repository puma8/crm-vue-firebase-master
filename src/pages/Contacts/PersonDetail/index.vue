<template>
  <div class="column flex-1">
    <div class="row flex-1">
      <person-info class="col-4" />
      <person-activity class="col-8" />
    </div>
  </div>
</template>

<script>
import PersonInfo from './PersonInfo'
import PersonActivity from './PersonActivity'

export default {
  name: 'PersonDetail',
  components: {
    'person-info': PersonInfo,
    'person-activity': PersonActivity
  }
}
</script>
