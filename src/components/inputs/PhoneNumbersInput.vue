<template>
  <div>
    <div class="row" v-for="phoneNumber in value" :key="`phone-${phoneNumber.id}`">
      <div class="row items-center flex-1">
        <addable-select
          className="col-4"
          v-model="phoneNumber.type"
          :options="generalSettings.phoneTypes"
          option-label="text"
          option-value="id"
          dense
          entityName="Phone Type"
          :add-func="addPhoneType"
        />
        <q-input
          class="col-8 q-pl-md"
          v-model="phoneNumber.text"
          dense
          :hide-bottom-space="true"
        />
      </div>
      <q-btn round flat dense icon="clear" @click="removePhone(phoneNumber.id)" />
    </div>
    <q-btn class="q-mt-md" color="primary" flat dense size="sm" label="+Add one more" @click="addMore" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AddableSelect from '../inputs/AddableSelect'

export default {
  name: 'PhoneNumbersInput',
  props: ['value'],
  components: {
    'addable-select': AddableSelect
  },
  computed: {
    ...mapGetters({
      generalSettings: 'settings/general'
    })
  },
  methods: {
    addPhoneType (value) {
      return this.$firebase.setting.general.phoneType.create({ text: value })
    },
    removePhone (id) {
      this.$emit('input', this.value.filter(ph => ph.id !== id))
    },
    addMore () {
      this.$emit('input', this.value.concat({
        id: Date.now(),
        text: ''
      }))
    }
  }
}
</script>

<style>

</style>
