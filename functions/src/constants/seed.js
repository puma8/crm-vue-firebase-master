import roles, { OWNER, ADMIN, USER } from './roles'

export default {
  settings: {
    general: {
      country: 'US',
      currency: 'USD',
      dateFormat: 'YYYY-MM-DD',
      subdomain: 'sample',
      timeFormat: 'HH:MM:SS',
      timezone: 'UTC-4',
      phoneTypes: [{
        id: 'main',
        text: 'Main'
      }, {
        id: 'office',
        text: 'Office'
      }],
      emailTypes: [{
        id: 'main',
        text: 'Main'
      }, {
        id: 'home',
        text: 'Home'
      }]
    },
    deal: {
      boards: [{
        id: 'proposal',
        text: 'Proposals'
      }, {
        id: 'job',
        text: 'Jobs'
      }, {
        id: 'service',
        text: 'Services'
      }],
      stages: [{
        id: 'proposal-proposed',
        boardId: 'proposal',
        text: 'Proposed',
        locked: true,
        order: 0
      }, {
        id: 'proposal-contacted',
        boardId: 'proposal',
        text: 'Contacted',
        order: 1
      }, {
        id: 'proposal-qualifying',
        boardId: 'proposal',
        text: 'Qualifying',
        order: 2
      }, {
        id: 'proposal-meetingScheduled',
        boardId: 'proposal',
        text: 'Meeting Scheduled',
        order: 3
      }, {
        id: 'job-proposed',
        boardId: 'job',
        text: 'Proposed',
        locked: true,
        order: 0
      }, {
        id: 'job-contacted',
        boardId: 'job',
        text: 'Contacted',
        order: 1
      }, {
        id: 'job-qualifying',
        boardId: 'job',
        text: 'Qualifying',
        order: 2
      }, {
        id: 'job-meetingScheduled',
        boardId: 'job',
        text: 'Meeting Scheduled',
        order: 3
      }, {
        id: 'service-proposed',
        boardId: 'service',
        text: 'Proposed',
        locked: true,
        order: 0
      }, {
        id: 'service-contacted',
        boardId: 'service',
        text: 'Contacted',
        order: 1
      }, {
        id: 'service-qualifying',
        boardId: 'service',
        text: 'Qualifying',
        order: 2
      }, {
        id: 'service-meetingScheduled',
        boardId: 'service',
        text: 'Meeting Scheduled',
        order: 3
      }],
      won: 'jobs',
      lost: [{
        id: 'insufficientBudget',
        text: 'Insufficient Budget'
      }, {
        id: 'notSatisfiedWithConditions',
        text: 'Not satisfied with conditions'
      }, {
        id: 'boughtFromCompetitor',
        text: 'Bought from competitor'
      }, {
        id: 'productDoesNotFitNeed',
        text: 'Product does not fit need'
      }]
    },
    project: {
      sections: [],
      customFields: []
    },
    person: {
      designations: [{
        id: 'client',
        text: 'Client'
      }, {
        id: 'vendor',
        text: 'Vendor'
      }]
    },
    security: {
      roles: roles,
      permissions: {
        view: {
          [OWNER]: 1,
          [ADMIN]: 1,
          [USER]: {
            admin: 0,
            otherwise: 1
          }
        },
        create: {
          [OWNER]: 1,
          [ADMIN]: {
            orgGDrive: 0,
            otherwise: 1
          },
          [USER]: {
            lead: 1,
            otherwise: 0
          }
        },
        read: {
          [OWNER]: 1,
          [ADMIN]: {
            users: 'isNotHigherThan',
            roles: 'isNotHigherThan',
            otherwise: 1
          },
          [USER]: {
            deals: 'isMemberOf',
            projects: 'isMemberOf',
            users: 'onlyMe',
            otherwise: 0
          }
        },
        edit: {
          [OWNER]: 1,
          [ADMIN]: 1,
          [USER]: {
            lead: 1,
            otherwise: 0
          }
        },
        delete: {
          [OWNER]: 1,
          [ADMIN]: 1,
          [USER]: 0
        }
      }
    }
  }
}
