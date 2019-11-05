<template>
  <fragment>
    <span class="text-subtitle1" style="width: 80px">Projects</span>
    <q-btn flat round dense icon="view_week"
      @click="$router.push({
        name: 'projects',
        query: {
          ...$route.query,
          viewMode: 'kanban'
        }
      })"
    />
    <q-btn flat round dense icon="menu"
      @click="$router.push({
        name: 'projects',
        query: {
          ...$route.query,
          viewMode: 'list'
        }
      })"
    />
    <q-separator vertical />
    <q-input borderless v-model="text" dense type="search">
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>
    <q-space />
  </fragment>
</template>

<script>

export default {
  name: 'ProjectsHeader',
  data () {
    return {
      text: ''
    }
  }
}
</script>

<style>

</style>
