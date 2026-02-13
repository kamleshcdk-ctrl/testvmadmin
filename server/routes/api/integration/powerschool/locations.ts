import axios from "axios";

export default eventHandler(async (event) => {
  try {
    const accessToken = await getCookieWithAccessToken(event)

    const postedParameters = await readBody(event)
    if (!postedParameters?.baseUrl || !accessToken) {
      throw new Error("baseUrl and accessToken required")
    }

    const schoolListResponse = await axios.get("/ws/v1/district/school", {
      baseURL: postedParameters.baseUrl,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    })

    // @ts-expect-error the location returned from the integration api is not typed
    const integrationLocations = schoolListResponse?.data?.schools?.school?.map(location => {
      return {
        id: location?.id,
        schoolNumber: location?.school_number,
        name: location?.name,
        location: location,
      }
    })

    return {
      success: true,
      count: 0,
      error: {},
      // data: schoolListResponse?.data?.schools?.school
      data: integrationLocations
    };
  } catch (err) {
    // eslint-disable-next-line
    console.log("locations error:", err)
    return {
      success: false,
      count: 0,
      error: err?.toString(),
      data: []
    };
  }
});
