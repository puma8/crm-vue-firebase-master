<template>
  <div class="content-container q-pa-md">
    <div class="row justify-between q-pb-md">
      <slot name="header-title"><div /></slot>
      <slot name="header-actions"><div /></slot>
    </div>
    <div class="column sections">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaddedContainer'
}
</script>

<style>
</style>
