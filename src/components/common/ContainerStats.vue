<template>
  <div class="row q-gutter-y-md q-px-md q-pb-md">
    <div :class="['col-12 row items-center', organization.slack ? 'editable' : '']">
      <div class="col-11 row">
        <div class="col-5">Slack Channel</div>
        <div class="col-7">{{slackChannel.name}}</div>
      </div>
      <div class="col-1" v-if="organization.slack">
        <q-btn icon="edit" rounded flat dense :class="!loading.slackChannel ? 'edit' : ''" :loading="loading.slackChannel" />
      </div>
      <q-popup-edit v-model="slackChannelId" buttons @save="updateSlackChannel" v-if="organization.slack">
        <addable-select
          v-model="slackChannelId"
          :options="slackChannels"
          option-label="name"
          option-value="channelId"
          label="Slack Channel"
          dense
          :add-func="addSlackChannel"
          :hide-bottom-space="true"
        />
      </q-popup-edit>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AddableSelect from '../inputs/AddableSelect'
import { notifySuccess, notifyFailure } from 'src/utils'

export default {
  name: 'ContainerStats',
  props: ['containerType', 'containerId'],
  components: {
    'addable-select': AddableSelect
  },
  data () {
    return {
      slackChannels: [],
      loading: {},
      slackChannelId: ''
    }
  },
  computed: {
    ...mapGetters({
      organization: 'organization/data',
      dealById: 'deals/dealById',
      projectById: 'projects/projectById'
    }),
    container () {
      return this[`${this.containerType}ById`](this.containerId)
    },
    slackChannel () {
      const container = this.container || {}
      return container.slackChannel || {}
    }
  },
  watch: {
    organization: function (val) {
      this.bind(val)
    },
    container (val) {
      this.slackChannelId = val.slackChannel ? val.slackChannel.id : ''
    }
  },
  mounted () {
    const container = this.container
    this.slackChannelId = container.slackChannel ? container.slackChannel.id : ''
    this.bind(this.organization)
  },
  methods: {
    bind (organization) {
      if (!organization) return

      if (organization.slack) {
        this.$bind(
          'slackChannels',
          this.$firebase.db.collection('slackChannels')
            .where('teamId', '==', organization.slack.teamId)
        )
      }
    },
    addSlackChannel (name) {
      return this.$firebase.cfApi('slack')({ name, action: 'createChannel' })
    },
    async updateSlackChannel () {
      this.$set(this.loading, 'slackChannel', true)
      try {
        await this.$firebase.cfApi('slack')({
          containerId: this.containerId,
          containerType: this.containerType,
          channelId: this.slackChannelId,
          action: 'linkWithSlackChannel'
        })
        notifySuccess('You successfully set slack channel')
      } catch (error) {
        notifyFailure(error.message)
      }
      this.$set(this.loading, 'slackChannel', false)
    }
  }
}
</script>

<style>

</style>
