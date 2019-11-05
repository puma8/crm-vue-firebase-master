<template>
  <q-dialog v-model="openModal" persistent>
    <q-card v-if="openModal" class="dialog-sm-sized">
      <q-card-section class="text-center">
        <div class="text-h6 text-weight-medium">{{isCreate ? 'Add user' : 'Edit user'}}</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <form>
          <q-input
            label="Name"
            v-model="name"
            dense
            autofocus
            @input="delayTouch($v.name, $options.touchMap)"
            :error="$v.name.$error"
            :hide-bottom-space="!$v.name.$error"
          />
          <q-input
            label="Email"
            v-model="email"
            type="email"
            dense
            @input="delayTouch($v.email, $options.touchMap)"
            :error="$v.email.$error"
            :hide-bottom-space="!$v.email.$error"
          />
        </form>
        <q-input
          label="Password"
          v-model="password"
          :type="isPwd ? 'password' : 'text'"
          @input="delayTouch($v.password, $options.touchMap)"
          dense
          :error="$v.password.$error"
          :hide-bottom-space="!$v.password.$error"
        >
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
        <role-select
          v-model="roleId"
          :error="$v.roleId.$error"
          :hide-bottom-space="!$v.roleId.$error"
        />
        <slack-user-selct v-model="slackUserId" :unlinked-only="true" v-if="organization.slack" />
        <front-user-select v-model="frontUserId" :unlinked-only="true" />
      </q-card-section>
      <q-card-section class="row justify-end q-gutter-x-md">
        <q-btn color="primary" label="Cancel" outline @click="cancel" />
        <q-btn
          color="primary"
          :label="isCreate ? 'Add user' : 'Update user'"
          :loading="loading"
          @click="manageUser"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { required, email } from 'vuelidate/lib/validators'
import { delayTouch, notifySuccess, notifyFailure } from 'src/utils'
import RoleSelect from '../inputs/RoleSelect'
import SlackUserSelect from '../inputs/SlackUserSelect'
import FrontUserSelect from '../inputs/FrontUserSelect'

export default {
  name: 'ManageUserDialog',
  touchMap: new WeakMap(),
  components: {
    'role-select': RoleSelect,
    'slack-user-selct': SlackUserSelect,
    'front-user-select': FrontUserSelect
  },
  computed: {
    ...mapGetters({
      userById: 'users/userById',
      organization: 'organization/data'
    })
  },
  data () {
    return {
      openModal: false,
      userId: '',
      meta: {},
      isCreate: true,
      isPwd: true,
      name: '',
      email: '',
      password: '',
      roleId: '',
      slackUserId: '',
      frontUserId: '',
      loading: false
    }
  },
  validations: {
    name: { required },
    email: { required, email },
    password: { required },
    roleId: { required }
  },
  methods: {
    open (userId, user = null) {
      this.reset(user || this.userById(userId))
      this.openModal = true
    },
    manageUser () {
      this.loading = true
      this.validateUserInfo()

      const {
        userId,
        name,
        email,
        password,
        roleId,
        slackUserId,
        frontUserId,
        meta = {}
      } = this

      if (this.isCreate) {
        this.$firebase
          .cfApi('user')({
            name,
            email,
            password,
            roleId,
            meta: {
              ...meta,
              slackUserId,
              frontUserId
            },
            action: 'add'
          })
          .then(result => {
            notifySuccess('The user is created successfully')
            this.reset()
            this.loading = false
            this.openModal = false
          })
          .catch(error => {
            notifyFailure(error.message)
            this.loading = false
            throw new Error(error.message)
          })
      } else {
        this.$firebase
          .cfApi('user')({
            id: userId,
            name,
            email,
            password,
            roleId,
            meta: {
              ...meta,
              slackUserId,
              frontUserId
            },
            action: 'update'
          })
          .then(result => {
            notifySuccess('The user is updated successfully')
            this.reset()
            this.loading = false
            this.openModal = false
          })
          .catch(error => {
            this.loading = false
            notifyFailure(error.message)
            throw new Error(error.message)
          })
      }
    },
    validateUserInfo () {
      let isInvalid = false
      if (
        this.$v.name.$invalid ||
        this.$v.email.$invalid ||
        this.$v.roleId.$invalid
      ) {
        this.$v.name.$touch()
        this.$v.email.$touch()
        this.$v.roleId.$touch()
        isInvalid = true
      }

      if (this.isCreate && this.$v.password.$invalid) {
        this.$v.password.$touch()
        isInvalid = true
      }

      if (isInvalid) {
        notifyFailure('You have some errors in the form')
        setTimeout(() => {
          this.loading = false
        }, 1000)
        throw new Error('You have some errors in the form')
      }
    },
    cancel () {
      this.reset()
      this.openModal = false
    },
    reset (user = {}) {
      this.userId = user.id
      this.isCreate = !user.id
      this.isPwd = true
      this.name = user.name || ''
      this.email = user.email || ''
      this.password = ''
      this.roleId = user.roleId || 'user'
      this.meta = user.meta || {}
      this.slackUserId = this.meta.slackUserId
      this.frontUserId = this.meta.frontUserId
      this.$v.name.$reset()
      this.$v.email.$reset()
      this.$v.password.$reset()
      this.$v.roleId.$reset()
    },
    delayTouch
  }
}
</script>

<style>
</style>
