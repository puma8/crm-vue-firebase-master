<template>
  <fragment>
    <div v-bind="$attrs" v-if="isText">
      {{this.customField.fieldValue}}
    </div>
    <div v-bind="$attrs" v-html="this.customField.fieldValue" v-else-if="isRichText" />
  </fragment>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'CustomFieldValue',
  props: ['customField', 'entity'],
  computed: {
    ...mapGetters({
      customFieldById: 'settings/customFieldById'
    }),
    enhancedCustomField () {
      return this.customFieldById(this.customField.id, this.entity) || {}
    },
    isText () {
      return this.enhancedCustomField.fieldTypeId === 'text'
    },
    isRichText () {
      return this.enhancedCustomField.fieldTypeId === 'richtext'
    }
  }
}
</script>

<style>

</style>
