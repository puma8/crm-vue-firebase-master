<template>
  <div :class="className">
    <q-select
      v-bind="$attrs"
      :options="filterOptions"
      :option-label="optionLabel"
      :option-value="optionValue"
      :value="value"
      :label="label"
      @filter="filterFn"
      @input="handleChange"
      emit-value
      map-options
      use-input
      ref="Select"
    />
    <simple-input-dialog ref="SimpleInputDialog" />
  </div>
</template>

<script>
import SimpleInputDialog from '../dialogs/SimpleInputDialog'
import { notifySuccess, notifyFailure } from 'src/utils'

export default {
  name: 'AddableSelect',
  inheritAttrs: false,
  props: ['value', 'options', 'optionLabel', 'optionValue', 'addFunc', 'className', 'label', 'entityName', 'disableAdd'],
  components: {
    'simple-input-dialog': SimpleInputDialog
  },
  data () {
    return {
      filterOptions: this.options,
      inputValue: ''
    }
  },
  computed: {
    sanitizedEntityName () {
      return this.entityName || this.label || 'Entity'
    }
  },
  watch: {
    options: function (value) {
      this.filterOptions = value
    }
  },
  methods: {
    handleChange (value) {
      this.$emit('input', value)

      if (value === -1) {
        this.$emit('input', '')
        this.$refs.SimpleInputDialog.open({
          title: `Enter ${this.sanitizedEntityName}`,
          label: this.sanitizedEntityName,
          initialValue: this.inputValue
        }, newValue => {
          return this.addFunc(newValue)
        }, (result, error) => {
          if (error) {
            notifyFailure(error.message)
          } else {
            notifySuccess(`The ${this.sanitizedEntityName} is successfully created`)
            this.$emit('input', result.data.id)
          }
        })
      }
    },
    filterFn (value, update) {
      this.inputValue = value
      update(() => {
        const options = this.options || []

        if (value === '') {
          this.filterOptions = options
        } else {
          this.$emit('input', '')
          const needle = value.toLowerCase()
          this.filterOptions = options.filter(
            v => v[this.optionLabel].toLowerCase().indexOf(needle) > -1
          )
        }

        if (!this.disableAdd) {
          this.filterOptions = [
            ...this.filterOptions,
            {
              [this.optionValue]: -1,
              [this.optionLabel]: 'Add New'
            }
          ]
        }
      })
    }
  }
}
</script>

<style>

</style>
