<template>
  <q-card :flat="flat">
    <q-card-section class="row" v-if="$permissionResolver.isOwner()">
      <img
        src="~assets/slack-logo.svg"
        class="q-ma-lg"
        style="width:10vw;max-width:272px;"
      >
      <div class="column justify-center q-gutter-y-md" v-if="!organization.slack || organization.slack.connectedBy===currentUser.id">
        <div>
          <a
            :href="`https://slack.com/oauth/authorize?scope=bot,users:read,users:read.email,channels:read,channels:write,chat:write:user,chat:write:bot&client_id=${slackConfig.clientId}&redirect_uri=${slackConfig.redirectUri}`"
            :disabled="organization.slack"
          >
            <img
              alt="Add to Slack"
              height="40"
              width="139"
              src="https://platform.slack-edge.com/img/add_to_slack.png"
              srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
            />
          </a>
          <!-- <q-btn color="primary" label="Connect now" @click="connectSlack" :loading="loading.slack" /> -->
        </div>
        <div v-if="!organization.slack">
          Integration will enable you to get updates on Slack about deals you own or follow.
        </div>
      </div>
    </q-card-section>
    <q-card-section v-if="organization.slack">
      <div class="q-pl-lg flex-1">
        <div>Slack {{organization.slack.teamName}} of Team ID-{{organization.slack.teamId}}</div>
        <q-separator />
        <div>Added {{organization.slack.createdAt | stringifyDate}} by {{userById(organization.slack.connectedBy).name}}</div>
      </div>
      <!-- <div class="q-gutter-x-md">
        <q-btn color="primary" label="Reconnect" />
        <q-btn color="primary" label="Disconnect" />
      </div> -->
    </q-card-section>
  </q-card>
</template>

<script>
import { mapGetters } from 'vuex'
import { stringifyDate } from 'src/utils/filters'
import config from '../../config'

export default {
  name: 'SlackIntegration',
  props: ['flat'],
  data () {
    return {
      slackConfig: {
        clientId: config().SLACK_CLIENT_ID,
        redirectUri: config().SLACK_OAUTH_REDIRECT_URI
      }
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
      userById: 'users/userById',
      integration: 'integration/slack',
      organization: 'organization/data'
    })
  },
  filters: { stringifyDate }
}
</script>

<style>

</style>
