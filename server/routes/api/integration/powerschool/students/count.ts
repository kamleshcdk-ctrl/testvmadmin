import axios from "axios";

export default eventHandler(async (event) => {
  try {
    const accessToken = await getCookieWithAccessToken(event)

    const postedParameters = await readBody(event)
    if (!postedParameters?.schoolId) {
      throw new Error("baseUrl and schoolId are required")
    }

    const studentCountResponse =
      await axios.get(`/ws/v1/school/${postedParameters.schoolId}/student/count`, {
        baseURL: postedParameters.baseUrl,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      })

    const studentCount: number = studentCountResponse?.data?.resource?.count || 0
    const pages = Math.ceil(studentCount / 100)

    return {
      success: true,
      pages: pages,
      count: studentCount,
      error: {},
      data: []
    };
  } catch (err) {
    // eslint-disable-next-line
    console.log("error:", err)
    return {
      success: false,
      pages: 0,
      count: 0,
      error: err?.toString(),
      data: []
    };
  }
});
