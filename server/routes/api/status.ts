

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  return {
    'testkey': `partial:${config?.tailscaleSigningKey?.substring(25, 33)}`,
    'cloudflareTeamName': `${config.cloudflareTeamName}`,
    'gitRef': `${config.public.gitRef}`,
    'factsSubscriptionKey': `${config.factsSubscriptionKey}`,
    'factsPmkSubscriptionKey': `${config.factsPmkSubscriptionKey}`,
    'factsPublicSubscriptionKey': `${config.public.FACTS_SUBSCRIPTION_KEY}`,
  }
})
