// Configuration for your app
const env = require('quasar-dotenv').config()

module.exports = function (ctx) {
  const conf = {
    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    boot: [
      'i18n',
      'firebase',
      'vuelidate',
      'routeGuard',
      'fragment',
      'vuefire',
      'permission',
      'gapi',
      'http'
    ],

    css: ['app.styl'],

    extras: [
      'roboto-font',
      'material-icons' // optional, you are not bound to it
      // 'ionicons-v4',
      // 'mdi-v3',
      // 'fontawesome-v5',
      // 'eva-icons'
    ],

    framework: {
      // all: true, // --- includes everything; for dev only!

      components: [
        'QLayout',
        'QHeader',
        'QDrawer',
        'QPageContainer',
        'QPage',
        'QToolbar',
        'QToolbarTitle',
        'QBtn',
        'QBtnDropdown',
        'QIcon',
        'QList',
        'QItem',
        'QItemSection',
        'QItemLabel',
        'QInput',
        'QSpinnerGears',
        'QTabs',
        'QTab',
        'QRouteTab',
        'QCard',
        'QCardSection',
        'QCardActions',
        'QTable',
        'QTh',
        'QTr',
        'QTd',
        'QDialog',
        'QSeparator',
        'QSpace',
        'QMenu',
        'QChip',
        'QPopupProxy',
        'QSelect',
        'QMarkupTable',
        'QBadge',
        'QLinearProgress',
        'QTabPanels',
        'QTabPanel',
        'QExpansionItem',
        'QAvatar',
        'QPopupEdit',
        'QBtnToggle',
        'QImg',
        'QDate',
        'QTime',
        'QToggle',
        'QSpinner',
        'QCheckbox',
        'QSlideTransition',
        'QEditor',
        'QField',
        'QTimeline',
        'QTimelineEntry',
        'QScrollArea',
        'QColor'
      ],

      directives: ['Ripple', 'ClosePopup', 'Ripple', 'TouchSwipe'],

      // Quasar plugins
      plugins: ['Notify', 'Dialog']

      // iconSet: 'ionicons-v4'
      // lang: 'de' // Quasar language
    },

    supportIE: true,

    build: {
      scopeHoisting: true,
      env,
      vueRouterMode: 'history',
      // vueCompiler: true,
      // gzip: true,
      // analyze: true,
      // extractCSS: false,
      extendWebpack (cfg) {
        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /node_modules/
        })
      }
    },

    devServer: {
      // https: true,
      // port: 8080,
      open: true // opens browser window automatically
    },

    // animations: 'all', // --- includes all animations
    animations: [],

    ssr: {
      pwa: false
    },

    pwa: {
      // workboxPluginMode: 'InjectManifest',
      // workboxOptions: {}, // only for NON InjectManifest
      manifest: {
        // name: 'Quasar App',
        // short_name: 'Quasar-PWA',
        // description: 'Best PWA App in town!',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'statics/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    },

    cordova: {
      // id: 'org.cordova.quasar.app'
      // noIosLegacyBuildFlag: true // uncomment only if you know what you are doing
    },

    electron: {
      // bundler: 'builder', // or 'packager'

      extendWebpack (cfg) {
        // do something with Electron main process Webpack cfg
        // chainWebpack also available besides this extendWebpack
      },

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Window only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration
        // appId: 'quasar-app'
      }
    }
  }

  if (process.env.ENV_MODE === 'PRODUCTION') {
    conf.htmlVariables = {
      iconFolder: 'icons/production'
    }
  } else {
    conf.htmlVariables = {
      iconFolder: 'icons/development'
    }
  }

  return conf
}
