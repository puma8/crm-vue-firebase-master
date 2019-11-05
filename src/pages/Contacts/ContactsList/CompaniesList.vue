<template>
  <unpadded-container>
    <template #content>
      <q-table
        :dense="$q.screen.lt.md"
        :data="listData"
        :columns="filteredColumns"
        row-key="name"
      >
        <template #header="props">
          <q-tr :props="props">
            <q-th key="name" :props="props" v-if="fields.includes('name')">Name</q-th>
            <q-th key="labels" :props="props" v-if="fields.includes('labels')">Labels</q-th>
            <q-th key="teamLead" :props="props" v-if="fields.includes('teamLead')">Team Lead</q-th>
            <q-th key="revenue" :props="props" v-if="fields.includes('revenue')">Revenue</q-th>
            <q-th key="createdAt" :props="props" v-if="fields.includes('createdAt')">Created At</q-th>
            <q-th key="settings" :props="props">
              <q-btn flat dense icon="settings" size="sm">
                <q-popup-proxy>
                  <div class="column q-pa-sm">
                    <q-checkbox v-model="fields" val="name" label="Name" dense />
                    <q-checkbox v-model="fields" val="labels" label="Labels" dense />
                    <q-checkbox v-model="fields" val="teamLead" label="Team Lead" dense />
                    <q-checkbox v-model="fields" val="revenue" label="Revenue" dense />
                    <q-checkbox v-model="fields" val="createdAt" label="Created t" dense />
                  </div>
                </q-popup-proxy>
              </q-btn>
            </q-th>
          </q-tr>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="name" :props="props">
              <router-link :to="`/companies/${props.row.id}`">{{ props.row.name }}</router-link>
            </q-td>
            <q-td key="labels" :props="props">{{ props.row.labels }}</q-td>
            <q-td key="teamLead" :props="props">{{ props.row.teamLead }}</q-td>
            <q-td key="revenue" :props="props">{{ props.row.revenue }}</q-td>
            <q-td key="createdAt" :props="props">{{ props.row.createdAt }}</q-td>
            <q-td key="settings" />
          </q-tr>
        </template>
      </q-table>
    </template>
  </unpadded-container>
</template>

<script>
import { mapGetters } from 'vuex'
import UnpaddedContainer from 'components/layouts/UnpaddedContainer'
import * as formatters from 'src/utils/formatters'

export default {
  name: 'CompaniesList',
  components: {
    'unpadded-container': UnpaddedContainer
  },
  data () {
    return {
      columns: [
        { name: 'name', label: 'TITLE', align: 'left', field: 'name', sortable: true },
        { name: 'labels', label: 'LABELS', align: 'left', field: 'labels', sortable: true },
        { name: 'teamLead', label: 'TEAM LEAD', field: 'teamLead', sortable: true },
        { name: 'revenue', label: 'REVENUE', field: 'revenue' },
        { name: 'createdAt', label: 'CREATION DATE', field: 'createdAt', sortable: true },
        { name: 'settings', fixed: true }
      ],
      fields: ['name', 'labels', 'teamLead', 'revenue', 'createdAt']
    }
  },
  computed: {
    ...mapGetters({
      companies: 'companies/list'
    }),
    listData () {
      return this.companies.map(company => ({
        ...company,
        createdAt: formatters.stringifiedDate(company.createdAt)
      }))
    },
    filteredColumns () {
      return this.columns.filter(column => column.fixed || this.fields.includes(column.name))
    }
  }
}
</script>

<style>

</style>
