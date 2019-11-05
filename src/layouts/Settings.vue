<template>
  <q-page class="column">
    <q-toolbar class="fixed bg-white">
      <q-tabs shrink v-model="currentTab">
        <q-route-tab name="settings" label="Settings" :to="{name: 'personal'}" />
        <q-route-tab name="billing" label="Billing" :to="{name: 'billing'}" />
      </q-tabs>
    </q-toolbar>
    <div class="row page-settings">
      <q-tabs vertical class="col-auto text-teal fixed menu">
        <q-route-tab name="personal" label="Personal settings" :to="{name: 'personal'}" />
        <q-route-tab name="general" label="General settings" :to="{name: 'general'}" />
        <q-route-tab name="users" label="Admin" :to="{name: 'users'}" v-if="$permissionResolver.canAccessAdmin()" />
        <q-route-tab name="important-fields" label="Important fields" :to="{name: 'important-fields'}" />
        <q-route-tab name="deal-stages" label="Deal stages" :to="{name: 'deal-stages'}" />
        <q-route-tab name="project-sections" label="Project Sections" :to="{name: 'project-sections'}" />
        <q-route-tab name="folder-template" label="Folder Template" :to="{name: 'folder-template'}" />
      </q-tabs>
      <div class="col container column">
        <router-view />
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'SettingsLayout',
  data () {
    return {
      currentTab: this.$route.name !== 'billing' ? 'settings' : 'billing'
    }
  }
}
</script>

<style>
</style>
