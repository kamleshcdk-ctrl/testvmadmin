// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  srcDir: 'src/',
  serverDir: './server',
  devServer: {
    port: 8079,
  },
  app: {
    head: {
      title: "Visitu Admin",
    },
  },
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/test-utils',
    '@pinia/nuxt',
    '@nuxtjs/apollo',
    '@vueuse/nuxt',
    '@formkit/nuxt',
    'nitro-cloudflare-dev'
  ],
  runtimeConfig: {
    // Private keys are only available on the server go here:
    clientId: process.env.NUXT_GOOGLE_CLIENT_ID,
    clientSecret: process.env.NUXT_GOOGLE_CLIENT_SECRET,
    tailscaleSigningKey: process.env.NUXT_TAILSCALE_SIGNING_KEY,
    factsSubscriptionKey: process.env.NUXT_FACTS_SUBSCRIPTION_KEY,
    factsPmkSubscriptionKey: process.env.NUXT_FACTS_PMK_SUBSCRIPTION_KEY,
    cloudflareTeamName: process.env.NUXT_CLOUDFLARE_TEAM_NAME,
    cloudflareTokenAudience: process.env.NUXT_CLOUDFLARE_TOKEN_AUDIENCE,
    allowableJobRunMinutes: process.env.NUXT_ALLOWABLE_JOB_RUN_MINUTES,
    minDelayedAttendanceRecords: process.env.NUXT_MIN_DELAYED_ATTENDANCE_RECORDS,

    // Public keys that are exposed to the client go here
    public: {
      graphqlUrl: process.env.NUXT_PUBLIC_GRAPHQL_URL,
      gitRef: process.env.NUXT_PUBLIC_GIT_REF,
      DIRECT_GRAPHQL_URL: process.env.NUXT_PUBLIC_DIRECT_GRAPHQL_URL,
      MAPBOX_TOKEN: process.env.NUXT_PUBLIC_MAPBOX_TOKEN || 'NONE',
      FORMKIT_PRO_KEY: process.env.NUXT_PUBLIC_FORMKIT_PRO_KEY,
      AGGRID_PRO_KEY: process.env.NUXT_PUBLIC_AGGRID_PRO_KEY,
      DEPLOYED_COMMIT_BRANCH: process.env.AWS_BRANCH || 'local',
      DEPLOYED_COMMIT_VERSION: process.env.AWS_COMMIT_ID || 'local',
      SENTRY_DSN: 'https://',
      FACTS_SUBSCRIPTION_KEY: process.env.NUXT_PUBLIC_FACTS_SUBSCRIPTION_KEY
    }
  },
  components: {
    dirs: ['~/components', '~/components/integrations']
  },
  postcss: {
    plugins: {
      autoprefixer: {},
    },
  },
  fonts: {
    provider: 'local',
  },
  formkit: {
    autoImport: true
  },
  apollo: {
    clients: {
      default: {
        httpEndpoint: `/graphql`,
        httpLinkOptions: {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json'
          }
        }
      },
    },
  },
  typescript: {
    strict: true
  },
  routeRules: {
    '/api/**': { ssr: true },
    // renders only on client-side
    '/**': { ssr: false },
  },
  nitro: {
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      wrangler: {
        "observability": {
          "logs": {
            "enabled": true
          }
        },
        vars: {
          //NUXT_PUBLIC_: '...',
        },
      }
    },
    experimental: {
      tasks: true
    },
    scheduledTasks: {
      // Run `send:status` task every minute
      '45 * * * *': ['send:job-status']
    },
    // @ts-expect-error observability
    observability: {
      logs: {
        enabled: true
      }
    }
  },

})
