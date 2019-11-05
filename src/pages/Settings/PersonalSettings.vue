<template>
  <div class="flex-1 column">
    <padded-container style="flex-grow: 0;">
      <template #header-title>
        <div class="text-h6 text-weight-bold">Profile settings</div>
      </template>
      <template #header-actions>
        <q-btn color="primary" label="Save" />
      </template>
      <template #content>
        <q-card>
          <q-card-section>Profile Settings</q-card-section>
        </q-card>
      </template>
    </padded-container>
    <padded-container style="flex-grow: 0;">
      <template #header-title>
        <div class="text-h6 text-weight-bold">Google account</div>
      </template>
      <template #content>
        <google-drive-integration />
      </template>
    </padded-container>
    <padded-container class="flex-1">
      <template #header-title>
        <div class="text-h6 text-weight-bold">Slack integration</div>
      </template>
      <template #content>
        <slack-integration />
      </template>
    </padded-container>
    <padded-container class="flex-1">
      <template #header-title>
        <div class="text-h6 text-weight-bold">Nylas integration</div>
      </template>
      <template #content>
        <nylas-integration />
      </template>
    </padded-container>
  </div>
</template>

<script>
import PaddedContainer from 'components/layouts/PaddedContainer'
import GoogleDriveIntegration from 'components/widgets/GoogleDriveIntegration'
import SlackIntegration from 'components/widgets/SlackIntegration'
import NylasIntegration from 'components/widgets/NylasIntegration'

export default {
  name: 'PersonalSettings',
  components: {
    'padded-container': PaddedContainer,
    'google-drive-integration': GoogleDriveIntegration,
    'slack-integration': SlackIntegration,
    'nylas-integration': NylasIntegration
  }
}
</script>

<style>
</style>
