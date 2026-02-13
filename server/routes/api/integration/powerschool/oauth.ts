import axios from "axios";

export default eventHandler(async (event) => {

  const postedParameters = await readBody(event)

  // Specify a 'tenantDomain' to store an auth token for that tenant or use the same cookie for all
  const tenantDomain = postedParameters.tenantDomain || "any-tenant";
  const authCookieName = `integration-oauth-${tenantDomain}`

  const existingAuthToken = getCookie(event, authCookieName)

  // Create cookie with oauth token if none is stored in the cookie
  if (!existingAuthToken || existingAuthToken.length < 10 ||
    postedParameters?.reconnect === true) {
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");

    const resp = await axios
      .post("/oauth/access_token", params, {
        baseURL: postedParameters.baseUrl,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        auth: {
          username: postedParameters.clientId,
          password: postedParameters.clientSecret,
        },
      })
      .then((r) => r.data)

    const accessToken = resp?.access_token
    setCookie(event, authCookieName, accessToken)

    return {
      token: accessToken
    };
  }

  return {
    token: existingAuthToken
  };
});
