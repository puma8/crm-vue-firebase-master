<template>
  <div>
    <container-stats containerType="project" :containerId="$route.params.id" />
  </div>
</template>

<script>
import ContainerStats from 'components/common/ContainerStats'
export default {
  name: 'ProjectStats',
  components: {
    'container-stats': ContainerStats
  }
}
</script>

<style>

</style>
