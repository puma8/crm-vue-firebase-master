<template>
  <div class="row q-gutter-x-xs">
    <q-chip
      :removable="!readOnly"
      @remove="removeTag(tag.id)"
      v-for="tag in enhancedTags"
      :key="tag.id"
      :color="tag.color"
      class="text-white"
      dense
    >{{tag.name}}</q-chip>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'TagsList',
  props: ['tags', 'containerId', 'containerType', 'readOnly'],
  computed: {
    ...mapGetters({
      dealSettings: 'settings/deal',
      projectSettings: 'settings/project'
    }),
    allTags () {
      if (this.containerType === 'deal') {
        return this.dealSettings.tags || []
      } else if (this.containerType === 'project') {
        return this.projectSettings.tags || []
      } else {
        return []
      }
    },
    enhancedTags () {
      const tags = this.tags || []
      return tags
        .map(tagId => this.allTags.find(tag => tag.id === tagId))
        .filter(tag => tag)
    }
  },
  methods: {
    removeTag (tagId) {
      const containerTags = this.tags.filter(id => id !== tagId)
      this.$firebase[this.containerType].update({
        id: this.containerId,
        tags: containerTags
      })
    }
  }
}
</script>

<style>
</style>
