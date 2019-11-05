<template>
  <primary-page-layout>
    <template #header>
      <project-header />
    </template>
    <template #content>
      <router-view />
    </template>
  </primary-page-layout>
</template>

<script>
import PrimaryPageLayout from './PrimaryPageLayout'
import ProjectHeader from '../pages/Projects/ProjectHeader'

export default {
  name: 'ProjectPrimaryLayout',
  components: {
    'project-header': ProjectHeader,
    'primary-page-layout': PrimaryPageLayout
  }
}
</script>

<style>
</style>
