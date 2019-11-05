<template>
  <div>
    <q-select
      v-bind="$attrs"
      :options="filteredPeople"
      option-value="id"
      option-label="name"
      emit-value
      map-options
      :value="currentValue"
      @input="handleInput"
      @remove="handleRemove"
      @filter="filterFn"
      label="People"
      :use-chips="multiple"
      :multiple="multiple"
      input-debounce="0"
      dense
      use-input
      @keyup.enter.stop
    >
      <template #option="scope">
        <q-item v-bind="scope.itemProps" v-on="scope.itemEvents" class="editable">
          <q-item-section>
            <q-item-label v-html="scope.opt.name"></q-item-label>
          </q-item-section>
          <q-item-section side v-if="scope.opt.id !== -1">
            <div class="row">
              <q-btn
                class="edit"
                icon="edit"
                rounded
                flat
                dense
                @click.stop="handleEditContact(scope.opt)"
              />
              <q-btn
                class="edit"
                icon="delete"
                rounded
                flat
                dense
                @click.stop="handleDeleteContact(scope.opt)"
              />
            </div>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
    <q-markup-table separator="none" flat>
      <thead v-if="selectedPeople.length">
        <tr>
          <th class="text-left">Name</th>
          <th class="text-left">Designation</th>
          <th class="text-left">Role</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(person, index) in selectedPeople" :key="index">
          <td class="text-left">{{person.name}}</td>
          <td class="text-left">{{designationById(person.designationId).text}}</td>
          <td class="text-left">{{roleById(person.roleId).text}}</td>
        </tr>
      </tbody>
    </q-markup-table>
    <manage-people-dialog ref="ManagePeopleDialog" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ManagePeopleDialog from 'components/dialogs/ManagePeopleDialog'

export default {
  name: 'PeopleSelect',
  inheritAttrs: false,
  props: {
    value: [String, Array],
    multiple: {
      default: true,
      type: Boolean
    }
  },
  components: {
    'manage-people-dialog': ManagePeopleDialog
  },
  data () {
    return {
      filteredPeople: []
    }
  },
  computed: {
    ...mapGetters({
      people: 'people/list',
      designationById: 'settings/designationById',
      roleById: 'settings/roleById'
    }),
    selectedPeople () {
      if (this.multiple) {
        return this.people.filter(({ id }) => this.value.indexOf(id) !== -1)
      } else {
        return this.people.filter(({ id }) => this.value === id)
      }
    },
    currentValue () {
      if (this.multiple) {
        return this.value
          .filter(uid => uid !== -1)
          .map(uid => {
            if (this.filteredPeople.find(u => u.id === uid)) {
              return uid
            } else {
              const user = this.people.find(u => u.id === uid) || {}
              return user.name
            }
          })
      } else {
        if (this.filteredPeople.find(u => u.id === this.value)) {
          return this.value
        } else {
          const user = this.people.find(u => u.id === this.value) || {}
          return user.name
        }
      }
    }
  },
  mounted () {
    this.filteredPeople = this.people
  },
  watch: {
    people (value) {
      this.filteredPeople = value
    }
  },
  methods: {
    handleEditContact (contact) {
      this.$refs.ManagePeopleDialog.open(contact)
    },
    handleDeleteContact (contact) {
      this.$q
        .dialog({
          title: 'Confirm',
          message: 'Do you really want to delete this contact?',
          cancel: true,
          persistent: true
        })
        .onOk(() => {
          return this.$firebase.people.delete(contact.id)
        })
    },
    emitValue (value) {
      if (this.multiple) {
        if (this.value.length < value.length) {
          this.$emit('input', [
            ...this.value,
            ...value.slice(this.value.length)
          ])
        }
      } else {
        this.$emit('input', value)
      }
    },
    handleInput (value) {
      const latestInput = this.multiple ? value[value.length - 1] : value
      if (latestInput === -1) {
        this.$refs.ManagePeopleDialog.open(null, id => {
          this.emitValue([...value.slice(this.value.length), id])
        })
      } else {
        this.emitValue(value)
      }
    },
    handleRemove (details) {
      if (this.multiple) {
        this.$emit(
          'input',
          this.value.filter((_, index) => index !== details.index)
        )
      }
    },
    filterFn (val, update) {
      update(() => {
        if (val === '') {
          this.filteredPeople = this.people
        } else {
          const needle = val.toLowerCase()
          this.filteredPeople = this.people.filter(
            u => u.name.toLowerCase().indexOf(needle) > -1
          )
        }

        this.filteredPeople = [
          ...this.filteredPeople,
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
