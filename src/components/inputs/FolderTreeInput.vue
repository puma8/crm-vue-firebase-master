<template>
  <div>
    <div style="margin-left: 20px;" v-for="(folder, index) in value" :key="index">
      <div class="row items-end">
        <q-input
          class="flex-1"
          :value="folder.title"
          @input="$event => handleInput(index, $event)"
          dense
        />
        <q-btn icon="add" dense flat @click="addFolder(index)" />
        <q-btn icon="clear" dense flat @click="clearFolder(index)" />
      </div>
      <FolderTreeInput v-model="folder.children" v-if="folder.children && folder.children.length > 0" />
    </div>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'FolderTreeInput',
  props: ['value'],
  methods: {
    handleInput (changedIndex, title) {
      const newValue = this.value.map((folder, index) => changedIndex === index ? ({
        ...folder,
        title
      }) : folder)
      this.$emit('input', newValue)
    },
    addFolder (addableIndex) {
      const newValue = this.value.map((folder, index) => addableIndex === index ? ({
        ...folder,
        children: _.compact(_.concat(folder.children, {
          title: 'New Folder'
        }))
      }) : folder)
      this.$emit('input', newValue)
    },
    clearFolder (clearedIndex) {
      const newValue = this.value.filter((folder, index) => clearedIndex !== index)
      this.$emit('input', newValue)
    }
  }
}
</script>

<style>

</style>
