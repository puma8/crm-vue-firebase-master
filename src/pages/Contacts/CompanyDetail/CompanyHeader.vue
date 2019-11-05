<template>
  <div class="q-px-sm q-py-md bg-grey-3">
    <div class="row q-gutter-xs items-center">
      <q-btn flat dense icon="keyboard_arrow_left" @click="$router.back()" />
      <span class="text-h6 editable">
        {{company.name}}
        <q-popup-edit v-model="newName" buttons @save="updateName">
          <q-input v-model="newName" dense autofocus />
        </q-popup-edit>
        <q-btn icon="edit" rounded flat dense :class="!loading.name ? 'edit' : ''" :loading="loading.name" />
      </span>
      <q-space />
      <q-btn flat round dense icon="more_horiz" />
    </div>
    <div class="row q-pa-sm q-gutter-xs">
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { notifySuccess, notifyFailure } from 'src/utils'

export default {
  name: 'CompanyHeader',
  data () {
    return {
      newName: '',
      loading: {}
    }
  },
  computed: {
    ...mapGetters({
      companyById: 'companies/companyById'
    }),
    company () {
      return this.companyById(this.$route.params.id)
    }
  },
  watch: {
    company: function (val) {
      this.setData(val)
    }
  },
  created () {
    this.setData(this.company)
  },
  methods: {
    setData (company) {
      this.newName = company.name
    },
    updateName (value) {
      this.updateCompany({ ...this.company, name: value }, 'name')
    },
    updateCompany (updatedCompany, field) {
      this.$set(this.loading, field, true)
      this.$firebase.company.update(updatedCompany)
        .then(() => {
          this.$set(this.loading, field, false)
          notifySuccess('The company is updated successfully')
        })
        .catch(error => {
          this.$set(this.loading, field, false)
          notifyFailure(error.message)
        })
    }
  }
}
</script>

<style>

</style>
