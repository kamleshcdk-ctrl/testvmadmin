import axios from "axios";
import type { H3Event } from "h3";

async function retryOn429<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000,
  maxDelayMs = 16000
): Promise<T> {
  try {
    return await fn();
  }
  // eslint-disable-next-line
  catch (error: any) {
    if (error?.response?.status === 429 && retries > 0) {
      // eslint-disable-next-line
      console.log(`Retrying 429 request attendance info`);
      const jitter = Math.random() * delayMs;
      const waitTime = Math.min(delayMs + jitter, maxDelayMs);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return retryOn429(fn, retries - 1, Math.min(delayMs * 2, maxDelayMs), maxDelayMs);
    }
    throw error;
  }
}

export default eventHandler(async (event: H3Event) => {
  try {
    const postedParameters = (await readBody(event)) as {
      baseUrl: string;
      headers?: Record<string, string>;
      filters?: string;
      sorts?: string | null;
      page?: number;
      pageSize?: number;
    };

    if (!postedParameters?.baseUrl) {
      throw new Error("baseUrl is required");
    }

    const customHeaders = postedParameters?.headers || {};
    const filters = postedParameters?.filters || "";
    const sorts = postedParameters?.sorts ?? "null";
    const page = postedParameters?.page ?? 1;

    const maxPageSize = 50000;
    const pageSize = Math.min(postedParameters?.pageSize ?? maxPageSize, maxPageSize);

    const axiosInstance = axios.create({
      baseURL: postedParameters.baseUrl,
      headers: { ...customHeaders },
      timeout: 15000,
    });

    // Fire both requests in parallel
    const [attendanceCodesResponse, attendanceResponse] = await Promise.all([
      retryOn429(() => axiosInstance.get('/academics/AttendanceCodes')),
      retryOn429(() =>
        axiosInstance.get('/People/StudentAttendance', {
          params: {
            Filters: filters,
            Sorts: sorts,
            Page: page,
            PageSize: pageSize,
            "api-version": "1.0",
          },
        })
      ),
    ]);

    const attendanceCodes = attendanceCodesResponse?.data?.results || [];
    const codeMap: Record<string, string> = {};
    attendanceCodes.forEach((codeObj: { code: string; name: string }) => {
      codeMap[codeObj.code] = codeObj.name;
    });

    const attendanceData = attendanceResponse?.data?.results || [];
    // eslint-disable-next-line
    const enhancedAttendanceData = attendanceData.map((item: Record<string, any>) => {
      const code = item.attendanceCode || item.code || item.attdCode || null;
      return {
        ...item,
        attendanceCodeName: codeMap[code] || null,
      };
    });

    return {
      success: true,
      error: {},
      data: enhancedAttendanceData,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: (err as Error)?.toString?.() || "Unknown error",
      data: [],
    };
  }
});
