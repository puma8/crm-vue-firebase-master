<template>
  <div>
    <q-select
      v-bind="$attrs"
      :options="filteredCompanies"
      option-value="id"
      option-label="name"
      emit-value
      map-options
      :value="value"
      @input="handleInput"
      @filter="filterFn"
      label="Company"
      input-debounce="0"
      dense
      use-input
      @keyup.enter.stop
    >
      <template #option="scope">
        <q-item
          v-bind="scope.itemProps"
          v-on="scope.itemEvents"
          class="editable"
        >
          <q-item-section>
            <q-item-label v-html="scope.opt.name"></q-item-label>
          </q-item-section>
          <q-item-section side v-if="scope.opt.id !== -1">
            <div class="row">
              <q-btn class="edit" icon="edit" rounded flat dense @click.stop="handleEditCompany(scope.opt)" />
              <q-btn class="edit" icon="delete" rounded flat dense @click.stop="handleDeleteCompany(scope.opt)" />
            </div>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
    <manage-company-dialog ref="ManageCompanyDialog" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ManageCompanyDialog from 'components/dialogs/ManageCompanyDialog'

export default {
  name: 'CompanySelect',
  inheritAttrs: false,
  props: {
    value: String
  },
  components: {
    'manage-company-dialog': ManageCompanyDialog
  },
  data () {
    return {
      filteredCompanies: []
    }
  },
  computed: {
    ...mapGetters({
      companies: 'companies/list'
    })
  },
  mounted () {
    this.filteredCompanies = this.companies
  },
  watch: {
    companies: function (value) {
      this.filteredCompanies = value
    }
  },
  methods: {
    handleEditCompany (company) {
      this.$refs.ManageCompanyDialog.open(company)
    },
    handleDeleteCompany (company) {

    },
    handleInput (value) {
      const latestInput = this.multiple ? value[value.length - 1] : value
      if (latestInput === -1) {
        this.$refs.ManageCompanyDialog.open(null, id => {
          this.$emit('input', id)
        })
      } else {
        this.$emit('input', value)
      }
    },
    filterFn (val, update) {
      update(() => {
        if (val === '') {
          this.filteredCompanies = this.companies
        } else {
          const needle = val.toLowerCase()
          this.filteredCompanies = this.companies.filter(
            u => u.name.toLowerCase().indexOf(needle) > -1
          )
        }

        this.filteredCompanies = [
          ...this.filteredCompanies,
          {
            id: -1,
            name: 'Add New'
          }
        ]
      })
    }
  }
}
</script>

<style>

</style>
