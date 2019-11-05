<template>
  <div>
    <div class="row" v-for="email in value" :key="`email-${email.id}`">
      <div class="row items-center flex-1">
        <addable-select
          className="col-4"
          v-model="email.type"
          :options="generalSettings.emailTypes"
          option-label="text"
          option-value="id"
          dense
          entityName="Email Type"
          :add-func="addEmailType"
        />
        <q-input
          class="col-8 q-pl-md"
          v-model="email.text"
          dense
          :hide-bottom-space="true"
        />
      </div>
      <q-btn round flat dense icon="clear" @click="removeEmail(email.id)" />
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
    addEmailType (value) {
      return this.$firebase.setting.general.emailType.create({ text: value })
    },
    removeEmail (id) {
      this.$emit('input', this.value.filter(email => email.id !== id))
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
