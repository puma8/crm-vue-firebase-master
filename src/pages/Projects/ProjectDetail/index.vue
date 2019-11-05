<template>
  <div class="column flex-1">
    <div class="row flex-1">
      <project-info class="col-4" />
      <project-activity class="col-8" />
    </div>
  </div>
</template>

<script>
import ProjectInfo from './ProjectInfo'
import ProjectActivity from './ProjectActivity'

export default {
  name: 'Project',
  components: {
    'project-info': ProjectInfo,
    'project-activity': ProjectActivity
  }
}
</script>
