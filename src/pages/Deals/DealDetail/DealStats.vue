<template>
  <div>
    <container-stats containerType="deal" :containerId="$route.params.id" />
  </div>
</template>

<script>
import ContainerStats from 'components/common/ContainerStats'
export default {
  name: 'DealStats',
  components: {
    'container-stats': ContainerStats
  }
}
</script>

<style>

</style>
