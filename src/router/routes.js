import Vue from 'vue'
import {
  dealsRouteValidation,
  projectsRouteValidation,
  contactsRouteValidation,
  todosRouteValidation
} from './validations'

const getPermissionResolver = () => Vue.prototype.$permissionResolver

const routes = [
  {
    path: '/',
    component: () => import('../layouts/Landing.vue'),
    children: [
      {
        name: 'home',
        path: '',
        component: () => import('../pages/Home.vue')
      },
      {
        name: 'login',
        path: 'login',
        component: () => import('pages/Auth/Auth.vue')
      },
      {
        name: 'register',
        path: 'register',
        component: () => import('pages/Auth/Auth.vue')
      }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/Main.vue'),
    children: [
      {
        path: '/',
        component: () => import('layouts/DealPrimaryLayout'),
        children: [
          {
            name: 'deals',
            path: 'deals',
            component: () => import('pages/Deals/DealsList'),
            props: route => ({
              board: route.query.board,
              viewMode: route.query.viewMode
            }),
            beforeEnter: dealsRouteValidation,
            meta: {
              requiresAuth: true
            }
          },
          {
            name: 'deal',
            path: 'deals/:id',
            component: () => import('pages/Deals/DealDetail'),
            children: [
              {
                name: 'deal-history',
                path: 'history',
                component: () => import('pages/History'),
                props: route => ({
                  containerId: route.params.id,
                  containerType: 'deal'
                }),
                meta: {
                  requiresAuth: true
                }
              },
              {
                name: 'deal-tasks',
                path: 'tasks',
                component: () => import('pages/Tasks/TasksList'),
                props: route => ({
                  containerId: route.params.id,
                  containerType: 'deal'
                }),
                meta: {
                  requiresAuth: true
                }
              },
              {
                name: 'deal-task',
                path: 'tasks/:taskId',
                component: () => import('pages/Tasks/TaskDetail'),
                props: route => ({
                  containerId: route.params.id,
                  containerType: 'deal',
                  taskId: route.params.taskId
                }),
                meta: {
                  requiresAuth: true
                }
              },
              {
                name: 'deal-inbox',
                path: 'inbox',
                props: route => ({
                  containerId: route.params.id,
                  containerType: 'deal'
                }),
                component: () => import('pages/Inbox/Inbox'),
                meta: {
                  requiresAuth: true
                }
              },
              {
                name: 'deal-events',
                path: 'events',
                props: route => ({
                  containerId: route.params.id,
                  containerType: 'deal'
                }),
                component: () => import('pages/Events'),
                meta: {
                  requiresAuth: true
                }
              }
            ]
          }
        ]
      },
      {
        path: '/',
        component: () => import('layouts/ProjectPrimaryLayout'),
        children: [
          {
            name: 'projects',
            path: 'projects',
            component: () => import('pages/Projects/ProjectsList'),
            props: route => ({
              viewMode: route.query.viewMode
            }),
            beforeEnter: projectsRouteValidation,
            meta: {
              requiresAuth: true
            }
          },
          {
            name: 'project',
            path: 'projects/:id',
            component: () => import('pages/Projects/ProjectDetail'),
            children: [
              {
                name: 'project-history',
                path: 'history',
                component: () => import('pages/History'),
                props: route => ({
                  containerId: route.params.id,
                  containerType: 'project'
                }),
                meta: {
                  requiresAuth: true
                }
              },
              {
                name: 'project-tasks',
                path: 'tasks',
                component: () => import('pages/Tasks/TasksList'),
                props: route => ({
                  containerId: route.params.id,
                  containerType: 'project'
                }),
                meta: {
                  requiresAuth: true
                }
              },
              {
                name: 'project-task',
                path: 'tasks/:taskId',
                component: () => import('pages/Tasks/TaskDetail'),
                props: route => ({
                  containerId: route.params.id,
                  containerType: 'project',
                  taskId: route.params.taskId
                }),
                meta: {
                  requiresAuth: true
                }
              },
              {
                name: 'project-inbox',
                path: 'inbox',
                props: route => ({
                  containerId: route.params.id,
                  containerType: 'project'
                }),
                component: () => import('pages/Inbox/Inbox'),
                meta: {
                  requiresAuth: true
                }
              },
              {
                name: 'project-events',
                path: 'events',
                props: route => ({
                  containerId: route.params.id,
                  containerType: 'project'
                }),
                component: () => import('pages/Events'),
                meta: {
                  requiresAuth: true
                }
              }
            ]
          }
        ]
      },
      {
        path: '/',
        component: () => import('layouts/ContactsPrimaryLayout'),
        children: [
          {
            name: 'contacts',
            path: 'contacts',
            component: () => import('pages/Contacts/ContactsList'),
            props: route => ({
              type: route.query.type
            }),
            beforeEnter: contactsRouteValidation,
            meta: {
              requiresAuth: true
            }
          },
          {
            name: 'person-detail',
            path: 'people/:id',
            component: () => import('pages/Contacts/PersonDetail'),
            meta: {
              requiresAuth: true
            }
          },
          {
            name: 'company-detail',
            path: 'companies/:id',
            component: () => import('pages/Contacts/CompanyDetail'),
            meta: {
              requiresAuth: true
            }
          }
        ]
      },
      {
        name: 'inbox',
        path: 'inbox',
        component: () => import('pages/Inbox/index.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        name: 'todos',
        path: 'todos',
        component: () => import('pages/ToDos/index.vue'),
        props: route => ({
          status: route.query.status
        }),
        beforeEnter: todosRouteValidation,
        meta: {
          requiresAuth: true
        }
      },
      {
        name: 'settings',
        path: 'settings',
        component: () => import('layouts/Settings.vue'),
        children: [
          {
            name: 'personal',
            path: 'personal',
            component: () => import('pages/Settings/PersonalSettings.vue'),
            meta: {
              requiresAuth: true
            }
          },
          {
            name: 'general',
            path: 'general',
            component: () => import('pages/Settings/GeneralSetting.vue'),
            meta: {
              requiresAuth: true
            }
          },
          {
            name: 'users',
            path: 'users',
            component: () => import('pages/Settings/Users.vue'),
            meta: {
              requiresAuth: true
            },
            beforeEnter (to, from, next) {
              if (getPermissionResolver().canAccessAdmin()) {
                next()
              } else {
                next({ name: 'personal' })
              }
            }
          },
          {
            name: 'important-fields',
            path: 'important-fields',
            component: () => import('pages/Settings/ImportantFields.vue'),
            meta: {
              requiresAuth: true
            }
          },
          {
            name: 'deal-stages',
            path: 'deal-stages',
            component: () => import('pages/Settings/DealStages.vue'),
            meta: {
              requiresAuth: true
            }
          },
          {
            name: 'project-sections',
            path: 'project-sections',
            component: () => import('pages/Settings/ProjectSections.vue'),
            meta: {
              requiresAuth: true
            }
          },
          {
            name: 'folder-template',
            path: 'folder-template',
            component: () => import('pages/Settings/FolderTemplate.vue'),
            meta: {
              requiresAuth: true
            }
          },
          {
            name: 'billing',
            path: 'billing',
            component: () => import('pages/Settings/Billing.vue'),
            meta: {
              requiresAuth: true
            }
          }
        ]
      }
    ]
  },
  {
    name: 'confirm-email',
    path: '/confirm-email',
    props: route => ({
      confirmationToken: route.query.confirmation_token
    }),
    component: () => import('pages/EmailConfirmation'),
    meta: {
      requiresAuth: true
    }
  },
  {
    name: 'redirected',
    path: '/redirected/:type',
    props: route => ({
      code: route.query.code
    }),
    component: () => import('pages/Redirected')
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
