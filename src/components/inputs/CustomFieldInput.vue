<template>
  <div>
    <q-input
      label="Field name"
      :value="value.fieldName"
      @input="handleFieldNameInput"
      dense
      autofocus
      :hide-bottom-space="!error.fieldName"
      :error="error.fieldName"
      :error-message="errorMessage.fieldName"
    />
    <q-select
      v-model="value.fieldTypeId"
      :options="fieldTypes"
      option-label="text"
      option-value="id"
      @input="handleFieldTypeSelect"
      label="Field Type"
      emit-value
      map-options
      dense
      :error="error.fieldTypeId"
      :hide-bottom-space="!error.fieldTypeId"
      :error-message="errorMessage.fieldTypeId"
    />
    <q-input
      v-if="isText"
      label="Field value"
      :value="value.fieldValue"
      @input="handleFieldValueInput"
      dense
      :hide-bottom-space="true"
    />
    <q-field
      v-if="isRichText"
      borderless
      :value="value.fieldValue"
      label="Field value"
      stack-label
      :hide-bottom-space="true"
    >
      <q-editor
        :value="value.fieldValue"
        @input="handleFieldValueInput"
        min-height="5rem"
        content-class="description"
        class="flex-1"
      />
    </q-field>
  </div>
</template>

<script>
const options = [{
  id: 'text',
  text: 'Text'
}, {
  id: 'richtext',
  text: 'Rich Text'
}]

export default {
  name: 'CustomFieldInput',
  props: ['value', 'error', 'error-message'],
  data () {
    return {
      fieldTypes: options
    }
  },
  computed: {
    isText () {
      return this.value.fieldTypeId === 'text'
    },
    isRichText () {
      return this.value.fieldTypeId === 'richtext'
    }
  },
  methods: {
    handleFieldNameInput (value) {
      this.$emit('input', {
        ...this.value,
        fieldName: value
      })
      this.$emit('change', 'fieldName')
    },
    handleFieldValueInput (value) {
      this.$emit('input', {
        ...this.value,
        fieldValue: value
      })
    },
    handleFieldTypeSelect (value) {
      this.$emit('input', {
        ...this.value,
        fieldTypeId: value,
        fieldValue: ''
      })
      this.$emit('change', 'fieldTypeId')
    }
  }
}
</script>

<style lang='stylus'>
  .description
    color rgba(0,0,0,0.87)
</style>
