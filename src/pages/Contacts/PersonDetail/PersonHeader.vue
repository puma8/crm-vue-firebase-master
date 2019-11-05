<template>
  <div class="q-px-sm q-py-md bg-grey-3">
    <div class="row q-gutter-xs items-center">
      <q-btn flat dense icon="keyboard_arrow_left" @click="$router.back()" />
      <span class="text-h6 editable">
        {{person.name}}
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
  name: 'PersonHeader',
  data () {
    return {
      newName: '',
      loading: {}
    }
  },
  computed: {
    ...mapGetters({
      personById: 'people/personById'
    }),
    person () {
      return this.personById(this.$route.params.id)
    }
  },
  watch: {
    person: function (val) {
      this.setData(val)
    }
  },
  created () {
    this.setData(this.person)
  },
  methods: {
    setData (person) {
      this.newName = person.name
    },
    updateName (value) {
      this.updatePerson({ ...this.person, name: value }, 'name')
    },
    updatePerson (updatedPeople, field) {
      this.$set(this.loading, field, true)
      this.$firebase.people.update(updatedPeople)
        .then(() => {
          this.$set(this.loading, field, false)
          notifySuccess('The person is updated successfully')
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
