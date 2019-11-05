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
            <q-th key="email" :props="props" v-if="fields.includes('email')">Email</q-th>
            <q-th key="phone" :props="props" v-if="fields.includes('phone')">Phone</q-th>
            <q-th key="designation" :props="props" v-if="fields.includes('designation')">Designation</q-th>
            <q-th key="role" :props="props" v-if="fields.includes('role')">Role</q-th>
            <q-th key="settings" :props="props">
              <q-btn flat dense icon="settings" size="sm">
                <q-popup-proxy>
                  <div class="column q-pa-sm">
                    <q-checkbox v-model="fields" val="name" label="Name" dense />
                    <q-checkbox v-model="fields" val="email" label="Email" dense />
                    <q-checkbox v-model="fields" val="phone" label="Phone" dense />
                    <q-checkbox v-model="fields" val="designation" label="Designation" dense />
                    <q-checkbox v-model="fields" val="role" label="Role" dense />
                  </div>
                </q-popup-proxy>
              </q-btn>
            </q-th>
          </q-tr>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="name" :props="props" v-if="fields.includes('name')">
              <router-link :to="`/people/${props.row.id}`">{{ props.row.name }}</router-link>
            </q-td>
            <q-td key="email" :props="props" v-if="fields.includes('email')">{{ props.row.email }}</q-td>
            <q-td key="phone" :props="props" v-if="fields.includes('phone')">{{ props.row.phone }}</q-td>
            <q-td key="designation" :props="props" v-if="fields.includes('designation')">{{ props.row.designation }}</q-td>
            <q-td key="role" :props="props" v-if="fields.includes('role')">{{ props.row.role }}</q-td>
            <q-td key="settings" :props="props" />
          </q-tr>
        </template>
      </q-table>
    </template>
  </unpadded-container>
</template>

<script>
import { mapGetters } from 'vuex'
import UnpaddedContainer from 'components/layouts/UnpaddedContainer'

export default {
  name: 'PeopleList',
  components: {
    'unpadded-container': UnpaddedContainer
  },
  data () {
    return {
      columns: [
        { name: 'name', align: 'left', label: 'NAME', field: 'name', sortable: true },
        { name: 'email', align: 'left', label: 'EMAIL', field: 'email', sortable: true },
        { name: 'phone', align: 'left', label: 'PHONE', field: 'phone', sortable: true },
        { name: 'designation', align: 'left', label: 'DESIGNATION', field: 'designation', sortable: true },
        { name: 'role', align: 'left', label: 'ROLE', field: 'role', sortable: true },
        { name: 'settings', fixed: true }
      ],
      fields: ['name', 'email', 'phone', 'designation', 'role']
    }
  },
  computed: {
    ...mapGetters({
      people: 'people/list',
      companyById: 'companies/companyById',
      designationById: 'settings/designationById',
      roleById: 'settings/roleById'
    }),
    listData () {
      return this.people.map(person => {
        const company = this.companyById(person.companyId)

        return {
          ...person,
          email: person.emails
            ? person.emails.map(email => email.text).join(' ')
            : 'N/A',
          phone: person.phoneNumbers
            ? person.phoneNumbers.map(phone => phone.text).join(' ')
            : 'N/A',
          designation: company && company.designationId
            ? this.designationById(company.designationId).text
            : 'N/A',
          role: company && company.roleId
            ? this.roleById(company.roleId).text
            : 'N/A'
        }
      })
    },
    filteredColumns () {
      return this.columns.filter(column => column.fixed || this.fields.includes(column.name))
    }
  }
}
</script>

<style>

</style>
