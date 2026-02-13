import type { EventHandlerRequest, H3Event } from 'h3';

export const getCookieWithAccessToken = async (event: H3Event<EventHandlerRequest>): Promise<string> => {
  const postedParameters = await readBody(event)
  const tenantDomain = postedParameters?.tenantDomain || "any-tenant";
  const authCookieName = `integration-oauth-${tenantDomain}`
  const accessToken = getCookie(event, authCookieName)

  if (!accessToken) {
    throw new Error("accessToken required")
  }
  if (!postedParameters?.baseUrl) {
    throw new Error("baseUrl required");
  }
  return accessToken
}
