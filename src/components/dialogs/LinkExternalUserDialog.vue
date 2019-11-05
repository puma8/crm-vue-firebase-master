<template>
  <q-dialog v-model="openModal">
    <q-card v-if="openModal" class="dialog-md-sized">
      <q-card-section class="text-center">
        <div class="text-h6 text-weight-medium">
          Link with
          <span class="text-capitalize">{{externalType}}</span>
          User - {{externalUser.name}}
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-list link v-if="isAsking">
          <q-item v-ripple clickable @click="linkWith('newUser')">
            <q-item-section>
              <q-item-label>Create a new CRM user with the {{externalType}} user's profile</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="navigate_next" />
            </q-item-section>
          </q-item>
          <q-item v-ripple clickable @click="linkWith('existingUser')">
            <q-item-section>
              <q-item-label>Link the {{externalType}} user with an existing CRM user</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="navigate_next" />
            </q-item-section>
          </q-item>
        </q-list>
        <user-select
          v-else
          v-model="userId"
          :slack-unlinked-only="externalType === 'slack'"
          :front-unlinked-only="externalType === 'front'"
        />
      </q-card-section>
      <q-card-section class="row justify-end q-gutter-x-md" v-if="isChoosing">
        <q-btn
          color="primary"
          label="Link"
          @click="link"
          :disable="Boolean(!userId)"
          :loading="loading"
        />
        <q-btn flat label="Back" @click="back" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import UserSelect from '../inputs/UserSelect'

const STATE = {
  asking: 'asking',
  choosing: 'choosing'
}

export default {
  name: 'LinkExternalUserDialog',
  data () {
    return {
      openModal: false,
      action: null,
      callback: () => {},
      state: STATE.asking,
      externalType: 'slack',
      externalUser: {},
      userId: '',
      loading: false
    }
  },
  components: {
    'user-select': UserSelect
  },
  computed: {
    isAsking () {
      return this.state === STATE.asking
    },
    isChoosing () {
      return this.state === STATE.choosing
    }
  },
  methods: {
    open (externalType, externalUser, action, callback) {
      this.reset()
      this.externalType = externalType
      this.externalUser = externalUser
      this.action = action
      this.callback = callback
      this.openModal = true
    },
    linkWith (userType) {
      if (userType === 'newUser') {
        this.callback('linkWithNewUser')
        this.openModal = false
      } else {
        this.state = STATE.choosing
      }
    },
    async link () {
      if (this.action) {
        this.loading = true
        try {
          const result = await this.action(this.userId)
          if (this.callback) {
            this.callback('linkWithExistingUser', result)
          }
        } catch (error) {
          if (this.callback) {
            this.callback('linkWithExistingUser', null, error)
          }
        }
      } else if (this.callback) {
        this.callback('linkWithExistingUser', this.userId)
      }
      this.loading = false
      this.openModal = false
    },
    back () {
      this.state = STATE.asking
    },
    reset () {
      this.state = STATE.asking
    }
  }
}
</script>

<style>
</style>
