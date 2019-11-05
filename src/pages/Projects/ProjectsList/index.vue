<template>
  <fragment>
    <projects-kanban v-if="viewMode === 'kanban'" />
    <projects-list v-if="viewMode === 'list'" />
  </fragment>
</template>

<script>
import ProjectsKanban from './ProjectsKanban'
import ProjectsList from './ProjectsList'
import { projectsRouteValidation } from 'src/router/validations'

export default {
  name: 'ProjectsLayout',
  props: ['viewMode'],
  components: {
    'projects-kanban': ProjectsKanban,
    'projects-list': ProjectsList
  },
  beforeRouteUpdate: projectsRouteValidation
}
</script>

<style>
</style>
