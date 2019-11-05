<template>
  <div class="window-height row justify-center items-center">
    <q-card class="card" v-if="!confirmationToken">
      <q-card-section>
        <div class="text-h6 text-center">Email Confirmation</div>
        <div class="text-center">
          An activation email has been sent to {{$firebase.auth.currentUser.email}}.
        </div>
        <div class="text-center">
          (If not received for a long time, please check the mail trash)
        </div>
      </q-card-section>
      <q-card-section class="row justify-center">
        <q-btn outline @click="resend">Resend an email</q-btn>
      </q-card-section>
    </q-card>
    <q-spinner class="primary" size="3rem" v-else />
  </div>
</template>

<script>
import { notifySuccess, notifyFailure } from 'src/utils'

export default {
  name: 'EmailConfirmation',
  props: ['confirmationToken'],
  async mounted () {
    if (this.confirmationToken) {
      const response = await this.$firebase.cfApi('user')({
        userId: this.$firebase.auth.currentUser.uid,
        confirmationToken: this.confirmationToken,
        action: 'confirmEmail'
      })

      switch (response.data.code) {
        case 'success':
          notifySuccess('Confirmation Successful!')
          this.$firebase.auth.currentUser.reload().then(() => {
            this.$router.push({ name: 'deals' })
          })
          break
        case 'invalid-token':
          notifyFailure('Confirmation token is invalid')
          this.$router.push({ name: 'login' })
          break
        case 'token-expired':
          notifyFailure('Confirmation token is expired. Please resend the confirmation email')
          this.$router.push({ name: 'confirm-email' })
          break
        default:
          break
      }
    }
  },
  methods: {
    async resend () {
      await this.$firebase.cfApi('user')({
        action: 'resendConfirmation',
        userId: this.$firebase.auth.currentUser.uid
      })
      notifySuccess('A confirmation email is sent again')
    }
  }
}
</script>

<style lang='stylus'>
  .card
    max-width 500px
    width: 100%
</style>
