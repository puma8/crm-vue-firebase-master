<template>
  <q-card>
    <q-card-section class="row" v-if="$permissionResolver.isOwner()">
      <div style="width: 10vw;;max-width:272px;" class="q-ma-lg row justify-center items-center">
        <img src="~assets/nylas-logo.png" style="width:5vw;" />
      </div>
      <div
        class="column justify-center q-gutter-y-md"
        v-if="!organization.nylas || organization.nylas.connectedBy===currentUser.id"
      >
        <q-btn
          type="a"
          :href="nylasOAuthUrl"
          color="primary"
          label="Connect now"
          @click="connect"
          :loading="loading"
          :disabled="organization.nylas"
        />
      </div>
    </q-card-section>
    <q-card-section v-if="organization.nylas">
      <div class="q-pl-lg flex-1">
        <div>Nylas {{organization.nylas.email}}</div>
        <q-separator />
        <div>Added {{organization.nylas.createdAt | stringifyDate}} by {{userById(organization.nylas.connectedBy).name}}</div>
      </div>
      <!-- <div class="q-gutter-x-md">
        <q-btn color="primary" label="Reconnect" />
        <q-btn color="primary" label="Disconnect" />
      </div>-->
    </q-card-section>
  </q-card>
</template>

<script>
import config from 'src/config'
import { mapGetters } from 'vuex'
import { stringifyDate } from 'src/utils/filters'

export default {
  name: 'NylasIntegration',
  data () {
    return {
      nylasOAuthUrl: `https://api.nylas.com/oauth/authorize?client_id=${
        config().NYLAS_CLIENT_ID
      }&response_type=code&redirect_uri=${
        config().NYLAS_REDIRECT_URL
      }&scopes=email.read_only`,
      loading: false
    }
  },
  computed: {
    ...mapGetters({
      organization: 'organization/data',
      userById: 'users/userById',
      currentUser: 'auth/user'
    })
  },
  filters: { stringifyDate },
  methods: {
    connect () {}
  }
}
</script>

<style>
</style>
