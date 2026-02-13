import axios, { type AxiosResponse } from "axios";
import type { IntegrationUser } from "~/types";
import { getCookieWithAccessToken } from "../../../../../utils/helpers";

interface PowerschoolStudentResponse {
  students: PowerschoolStudentList;
}
interface PowerschoolStudentList {
  student: PowerschoolStudent[];
}
interface PowerschoolStudent {
  id: number;
  name: PowerschoolName;
}
interface PowerschoolName {
  first_name: string;
  last_name: string;
}

async function getPageOfStudents(baseUrl: string, accessToken: string, schoolId: number, currentPageNumber: number) {
  const expansions = ["contact", "contact_info", "school_enrollment",
    "phones", "global_id", "demographics", "addresses"].join(",")

  const studentsResponsePage: AxiosResponse<PowerschoolStudentResponse> =
    await axios.get(
      `/ws/v1/school/${schoolId}/student?pagesize=100&page=${currentPageNumber}&expansions=${expansions}`, {
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    })

  const studentsPage = studentsResponsePage?.data?.students?.student?.map(student => {
    return {
      id: student?.id,
      userType: "student",
      name: `${student?.name?.first_name} ${student?.name?.last_name}`,
      raw: student,
    }
  })
  return studentsPage
}

export default eventHandler(async (event) => {
  try {
    const accessToken = await getCookieWithAccessToken(event)

    const postedParameters = await readBody(event)
    if (!postedParameters?.schoolId) {
      throw new Error("schoolId is required")
    }

    let allStudents: IntegrationUser[] = []
    if (postedParameters.page) {
      allStudents = await getPageOfStudents(postedParameters.baseUrl, accessToken,
        postedParameters.schoolId, postedParameters.page)

    } else {
      const studentCountResponse =
        await axios.get(`/ws/v1/school/${postedParameters.schoolId}/student/count`, {
          baseURL: postedParameters.baseUrl,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          }
        })

      const studentCount: number = studentCountResponse?.data?.resource?.count || 0

      const pages = Math.ceil(studentCount / 100)
      for (let currentPageNumber = 1; currentPageNumber <= pages; currentPageNumber++) {
        const studentsPage = await getPageOfStudents(postedParameters.baseUrl, accessToken,
          postedParameters.schoolId, currentPageNumber)
        studentsPage.forEach(student => {
          allStudents.push(student)
        })
      }
    }
    return {
      success: true,
      count: allStudents.length,
      error: {},
      data: allStudents
    };

  } catch (err) {
    // eslint-disable-next-line
    console.log("error:", err)
    return {
      success: false,
      count: 0,
      error: err?.toString(),
      data: []
    };
  }
});
