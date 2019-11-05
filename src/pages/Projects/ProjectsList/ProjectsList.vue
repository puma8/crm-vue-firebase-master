<template>
  <unpadded-container>
    <template #content>
      <q-table
        :dense="$q.screen.lt.md"
        :data="groupData"
        :columns="filteredColumns"
        row-key="name"
        :sort-method="sortProjects"
      >
        <template #header="props">
          <q-tr :props="props">
            <q-th key="name" :props="props" v-if="fields.includes('name')">Name</q-th>
            <q-th key="labels" :props="props" v-if="fields.includes('labels')">Labels</q-th>
            <q-th key="section" :props="props" v-if="fields.includes('section')">Section</q-th>
            <q-th key="revenue" :props="props" v-if="fields.includes('revenue')">Revenue</q-th>
            <q-th key="createdAt" :props="props" v-if="fields.includes('createdAt')">Created At</q-th>
            <q-th key="settings" :props="props">
              <q-btn flat dense icon="settings" size="sm">
                <q-popup-proxy>
                  <div class="column q-pa-sm">
                    <q-checkbox v-model="fields" val="name" label="Name" dense />
                    <q-checkbox v-model="fields" val="labels" label="Labels" dense />
                    <q-checkbox v-model="fields" val="section" label="Setion" dense />
                    <q-checkbox v-model="fields" val="revenue" label="Revenue" dense />
                    <q-checkbox v-model="fields" val="createdAt" label="Created At" dense />
                  </div>
                </q-popup-proxy>
              </q-btn>
            </q-th>
          </q-tr>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props" class="cursor-pointer" @click.native="collapseSection(props.row.sectionId)">
            <q-td key="name" :props="props" colspan="100%" class="text-weight-bold text-red">
              {{props.row.sectionTitle}}
            </q-td>
          </q-tr>
          <q-tr :props="props" v-show="!collapsed[props.row.sectionId]" v-for="project in props.row.projects" :key="project.id">
            <q-td key="name" :props="props">
              <router-link :to="{
                name: 'project-history',
                params: {id: project.id},
                query: $route.query
              }">{{ project.name }}</router-link>
            </q-td>
            <q-td key="labels" :props="props">
              <tags-list :tags="project.tags" containerType="project" :containerId="project.id" :read-only="true" />
            </q-td>
            <q-td key="section" :props="props">{{ project.section }}</q-td>
            <q-td key="revenue" :props="props">{{ project.revenue }}</q-td>
            <q-td key="createdAt" :props="props">{{ project.createdAt }}</q-td>
            <q-td key="settings" />
          </q-tr>
        </template>
      </q-table>
    </template>
  </unpadded-container>
</template>

<script>
import { mapGetters } from 'vuex'
import UnpaddedContainer from 'components/layouts/UnpaddedContainer'
import TagsList from 'components/common/TagsList'
import * as formatters from 'src/utils/formatters'
import _ from 'lodash'

export default {
  name: 'ProjectsList',
  components: {
    'unpadded-container': UnpaddedContainer,
    'tags-list': TagsList
  },
  data () {
    return {
      columns: [
        { name: 'name', label: 'TITLE', align: 'left', field: 'name', sortable: true },
        { name: 'labels', label: 'LABELS', align: 'left', field: 'labels' },
        { name: 'section', label: 'SECTION', field: 'section', sortable: true },
        { name: 'revenue', label: 'REVENUE', field: 'revenue' },
        { name: 'createdAt', label: 'CREATION DATE', field: 'createdAt', sortable: true },
        { name: 'settings', fixed: true }
      ],
      fields: ['name', 'labels', 'section', 'revenue', 'createdAt'],
      collapsed: {}
    }
  },
  computed: {
    ...mapGetters({
      projects: 'projects/list',
      projectSettings: 'settings/project',
      sectionById: 'settings/sectionById',
      shouldHideArchived: 'projects/shouldHideArchived'
    }),
    groupData () {
      const allSections = this.projectSettings.sections || []
      const filteredProjects = this.projects
        .filter(project => this.shouldHideArchived ? !project.archived : true)
        .filter(project => this.$permissionResolver.hasPermission('read', 'projects', project))
      const groupedBy = _.groupBy(filteredProjects, 'sectionId')
      const sections = _.keys(groupedBy)
      const result = sections.map(sectionId => {
        const section = this.sectionById(sectionId) || {}
        return {
          sectionId: section.id,
          sectionTitle: section.text,
          projects: groupedBy[sectionId].map(project => {
            const section = this.sectionById(project.sectionId) || {}
            return {
              ...project,
              stage: section.text,
              createdAt: formatters.stringifiedDate(section.createdAt)
            }
          })
        }
      })
      const append = allSections.filter(section => !sections.includes(section.id))
        .map(section => ({
          sectionId: section.id,
          sectionTitle: section.text,
          projects: []
        }))
      return [...result, ...append]
    },
    filteredColumns () {
      return this.columns.filter(column => column.fixed || this.fields.includes(column.name))
    }
  },
  methods: {
    collapseSection (sectionId) {
      this.$set(this.collapsed, sectionId, !this.collapsed[sectionId])
    },
    sortProjects: (rows, sortBy, desc) => {
      return rows.map(row => {
        const projects = _.sortBy(row.projects, sortBy)
        return {
          ...row,
          projects: desc ? projects : _.reverse(projects)
        }
      })
    }
  }
}
</script>
