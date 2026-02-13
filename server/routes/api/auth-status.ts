import * as jose from 'jose'
import axios from "axios";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const headers = getRequestHeaders(event)
  const headerToken = headers["cf-access-jwt-assertion"];

  if (!headerToken) {
    return {
      'testkey': `partial:${config?.tailscaleSigningKey?.substring(25, 30)}`,
    }
  }
  const cloudflareTokenAudience = `${config.cloudflareTokenAudience}`
  const cloudflareCertsUrl =
    `https://${config.cloudflareTeamName}.cloudflareaccess.com/cdn-cgi/access/certs`;

  const jwks = jose.createRemoteJWKSet(new URL(cloudflareCertsUrl))

  const { payload } = await jose.jwtVerify(headerToken, jwks, {
    issuer: `https://${config?.cloudflareTeamName}.cloudflareaccess.com`,
    audience: cloudflareTokenAudience,
  })

  const identityResponse = await axios.get('/cdn-cgi/access/get-identity', {
    baseURL: `https://${config?.cloudflareTeamName}.cloudflareaccess.com`,
    headers: {
      Cookie:
        `CF_Authorization=${headerToken}`
    }
  })

  const data = {
    'X-Tailscale-Name': `${identityResponse?.data?.name || 'Cloudflare User'}`,
    'X-Tailscale-Email': payload.email,
  }

  const secret = new TextEncoder().encode(
    config?.tailscaleSigningKey,
  )
  const alg = 'HS256'

  const token = await new jose.SignJWT(data)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secret)

  return {
    'headerToken': `partial:${headerToken?.substring(0, 5)}`,
    'testkey': `partial:${config?.tailscaleSigningKey?.substring(25, 33)}`,
    'verifiedToken': payload,
    'identity_name': identityResponse?.data?.name,

    'api_signed_token': token
  }
})
