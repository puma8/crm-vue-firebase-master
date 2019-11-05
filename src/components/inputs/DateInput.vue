<template>
  <q-input v-bind="$attrs" :value="inputValue" dense :mask="mask || 'date'" :rules="['date']">
    <template #append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
          <q-date :value="inputValue" @input="dateChange" :options="options" />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script>
import * as formatters from 'src/utils/formatters'

export default {
  name: 'DateInput',
  props: ['value', 'options', 'mapFirestore', 'mask'],
  computed: {
    inputValue () {
      return formatters.stringifiedDate(this.value)
    }
  },
  methods: {
    dateChange (value) {
      if (this.mapFirestore) {
        const date = formatters.toDate(value)
        this.$emit('input', this.$firebase.Timestamp.fromDate(date))
      } else {
        this.$emit('input', value)
      }
      this.$refs.qDateProxy.hide()
    }
  }
}
</script>

<style>
</style>
