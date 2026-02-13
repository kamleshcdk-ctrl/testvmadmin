import axios from "axios";
import type { H3Event } from "h3";

type Course = {
  courseID: number;
  title: string;
  attendance: boolean;
  homeRoom: boolean;
};

type ClassItem = {
  courseID: number;
  yearId: number;
  term1: boolean;
  term2: boolean;
  term3: boolean;
  term4: boolean;
  term5: boolean;
  term6: boolean;
};

const delay = (ms: number) =>
  new Promise((res) => setTimeout(res, ms + Math.floor(Math.random() * 500))); // jitter

// Retry wrapper with exponential backoff + jitter
async function fetchData(
  url: string,
  axiosInstance: ReturnType<typeof axios.create>,
  params: Record<string, unknown> = {},
  retryDelay = 1000,
  maxRetries = 5
  // eslint-disable-next-line
): Promise<any> {
  let retries = 0;
  while (true) {
    try {
      const response = await axiosInstance.get(url, {
        params,
        timeout: 15000,
      });
      return response.data;
      // eslint-disable-next-line
    } catch (error: any) {
      const status = error?.response?.status;
      if ((status === 429 || !status) && retries < maxRetries) {
        // eslint-disable-next-line
        console.log(`Retrying 429 request student schedule info`);
        retries++;
        const jitter = Math.random() * retryDelay;
        const waitTime = Math.min(retryDelay + jitter, 16000);
        await delay(waitTime);
        retryDelay *= 2;
      } else {
        // eslint-disable-next-line
        console.error(`Failed request to ${url}:`, error.message || error);
        throw error;
      }
    }
  }
}

export default eventHandler(async (event: H3Event) => {
  try {
    const body = (await readBody(event)) as {
      baseUrl: string;
      headers?: Record<string, string>;
      studentId: string;
      termId: number;
      yearId: number;
    };

    const { baseUrl, headers = {}, studentId, termId, yearId } = body;

    if (!baseUrl) throw new Error("baseUrl is required");
    if (!studentId) throw new Error("studentId is required");
    if (termId < 1 || termId > 6) throw new Error("termId must be 1-6");
    if (!yearId) throw new Error("yearId is required");

    const termKey = `term${termId}` as keyof ClassItem;

    const axiosInstance = axios.create({
      baseURL: baseUrl,
      headers,
      timeout: 15000,
    });

    // Fetch all classes for student and year
    const classRes = await fetchData(
      `/Classes/v2/Students/${studentId}`,
      axiosInstance,
      {
        filters: `yearId==${yearId}`,
        pageSize: 50000,
        "api-version": "1.0",
      }
    );

    const classes = (classRes.results ?? []) as ClassItem[];

    // Filter classes active for the term and extract courseIDs
    const courseIDs = classes
      .filter((c) => c[termKey])
      .map((c) => c.courseID)
      .filter(Boolean);

    // Deduplicate courseIDs
    const uniqueCourseIDs = Array.from(new Set(courseIDs));

    let courses: Course[] = [];

    try {
      const courseRes = await fetchData(
        `/Courses`,
        axiosInstance,
        {
          filters: `courseID==${uniqueCourseIDs.join('|')}`,
          pageSize: 100,
          "api-version": "1.0",
        }
      );

      if (courseRes?.results && courseRes?.results.length > 0) {
        courses = courseRes?.results;
      }
    } catch (err) {
      // eslint-disable-next-line
      console.error(`Error fetching courses - ${uniqueCourseIDs}:`, err);
    }

    // Determine if any course has homeRoom AND attendance
    const hasHomeRoomWithAttendance = courses.some(
      (c) => c.homeRoom && c.attendance
    );

    return {
      success: true,
      error: null,
      data: {
        studentId,
        hasHomeRoomWithAttendance,
        enrolledClasses: classes,
        courses, // all courses
      },
    };
  } catch (err) {
    // eslint-disable-next-line
    console.error("Fatal error:", err);
    return {
      success: false,
      error: (err as Error).message ?? "Unknown error",
      data: null,
    };
  }
});
