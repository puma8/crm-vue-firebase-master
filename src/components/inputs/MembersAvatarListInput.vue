<template>
  <div class="row q-gutter-x-xs items-center">
    <avatar :username="assignee.name" :src="assignee.photoUrl" :size="28" class="q-mr-sm" v-if="assignee" />
    <q-btn flat dense icon="add_circle_outline" v-if="!readonly & !loading" @click="openModal = true" />
    <q-spinner size="2em" v-if="loading" />
    <avatar :username="member.name" :src="member.photoUrl" :size="24" v-for="(member, index) in members" :key="index" />
    <q-dialog v-model="openModal">
      <q-card class="dialog-md-sized">
        <q-card-section>
          <members-select
            :value="value"
            @input="handleInput"
            :selectable-users="selectableUsers"
            :disable="loading"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Avatar from 'vue-avatar'
import MembersSelect from './MembersSelect'

export default {
  name: 'MembersAvatarListInput',
  props: ['assigneeId', 'value', 'readonly', 'actionFunc', 'selectableUsers', 'loading'],
  components: {
    'members-select': MembersSelect,
    avatar: Avatar
  },
  data () {
    return {
      openModal: false
    }
  },
  computed: {
    ...mapGetters({
      users: 'users/list'
    }),
    assignee () {
      return this.users.find(u => u.id === this.assigneeId)
    },
    members () {
      const members = this.value || []
      return this.users.filter(u => members.includes(u.id))
    }
  },
  methods: {
    handleInput (members) {
      if (this.actionFunc) {
        this.actionFunc(members)
      }

      this.$emit('input', members)
    }
  }
}
</script>

<style>
  .member-avatar {
    width: 24px;
    height: 24px;
  }
</style>
