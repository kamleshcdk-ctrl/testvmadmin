import axios from "axios";

export default eventHandler(async (event) => {
  const accessToken = await getCookieWithAccessToken(event)
  const postedParameters = await readBody(event)

  const scheduleUrl = "/ws/schema/query/com.visitu.project.student.studentschedulefordate"
  try {
    await axios
      .post(scheduleUrl, {}, {
        baseURL: postedParameters.baseUrl,
        params: {
          page: 1,
        },
        headers: {
          Authorization: `Bearer ${accessToken} `,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

    return {
      success: true,
      data: true
    }
  } catch (err) {
    // @ts-expect-error type for err.response
    if (err?.response?.status === 404 && err?.response?.data
      ?.message?.includes("com.visitu.project.student.studentschedulefordate' not found")) {
      // This is the error we expect when the plugin is not upgraded
      return {
        success: true,
        data: false
      }
    }
  }
  // We got some unexpected error
  return {
    success: false,
    data: false
  }
});
