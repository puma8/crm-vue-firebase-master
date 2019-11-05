<template>
  <q-input v-bind="$attrs" :value="inputValue" :mask="inputMask">
    <template #prepend>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
          <q-date :value="inputValue" @input="dateChange" :mask="dateMask" :options="dateOptions" />
        </q-popup-proxy>
      </q-icon>
    </template>
    <template #append>
      <q-icon name="access_time" class="cursor-pointer">
        <q-popup-proxy ref="qTimeProxy" transition-show="scale" transition-hide="scale">
          <q-time
            :value="inputValue"
            @input="dateChange"
            :mask="dateMask"
            :options="timeOptions"
            format24h
          />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script>
import * as formatters from 'src/utils/formatters'

export default {
  name: 'DateInput',
  props: [
    'value',
    'mapFirestore',
    'inputMask',
    'dateMask',
    'dateOptions',
    'timeOptions'
  ],
  computed: {
    inputValue () {
      return formatters.stringifiedDate(this.value, this.dateMask)
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
      this.$refs.qTimeProxy.hide()
    }
  }
}
</script>

<style>
</style>
