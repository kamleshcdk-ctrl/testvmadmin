import { joinURL } from 'ufo';
import * as jose from 'jose';
import axios from "axios";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const proxyUrl = `${runtimeConfig.public.DIRECT_GRAPHQL_URL}`;

  const path = event.path // .replace(/^\/gql\//, '')
  const targetUrl = joinURL(proxyUrl, path)

  if (proxyUrl === 'http://localhost:3000') {
    return proxyRequest(event, targetUrl)
  }

  // get cloudflare auth token
  const headers = getRequestHeaders(event)
  const headerToken = headers["cf-access-jwt-assertion"] || "<none>";

  // validate cloudflare auth token
  const cloudflareTokenAudience = `${runtimeConfig?.cloudflareTokenAudience}`
  const cloudflareCertsUrl =
    `https://${runtimeConfig?.cloudflareTeamName}.cloudflareaccess.com/cdn-cgi/access/certs`;

  const jwks = jose.createRemoteJWKSet(new URL(cloudflareCertsUrl))

  const { payload: verifiedToken } = await jose.jwtVerify(headerToken, jwks, {
    issuer: `https://${runtimeConfig?.cloudflareTeamName}.cloudflareaccess.com`,
    audience: cloudflareTokenAudience,
  })

  const identityResponse = await axios.get('/cdn-cgi/access/get-identity', {
    baseURL: `https://${runtimeConfig?.cloudflareTeamName}.cloudflareaccess.com`,
    headers: {
      Cookie:
        `CF_Authorization=${headerToken}`
    }
  })

  const data = {
    'X-Tailscale-Name': `${identityResponse?.data?.name || 'Admin Support User'}`,
    'X-Tailscale-Email': `${verifiedToken.email}`
  }


  const secret = new TextEncoder().encode(
    runtimeConfig?.tailscaleSigningKey,
  )
  const alg = 'HS256'

  const token = await new jose.SignJWT(data)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secret)

  const newHeaders = {
    ...data,
    'X-Tailscale-Token': token,
  }

  const originalHeaders = { ...event.node.req.headers }
  event.node.req.headers = {
    ...newHeaders,
    ...originalHeaders,
  }
  return proxyRequest(event, targetUrl)
})
