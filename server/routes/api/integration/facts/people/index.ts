import axios from "axios";
// eslint-disable-next-line
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event);
    const {
      baseUrl,
      headers = {},
      pageSize,
      filters,
    } = body || {};

    if (!baseUrl) throw new Error("baseUrl is required");

    // Helper to fetch data
    // eslint-disable-next-line
    const fetchData = async (url: string, params: Record<string, any> = {}) => {
      const response = await axios.get(url, {
        baseURL: baseUrl,
        headers,
        params,
      });
      return response.data;
    };

    // Fetch Students with demographics
    // eslint-disable-next-line
    const { results: students = [] }: { results: any[] } = await fetchData("/people", {
      filters,
      pageSize,
    });

    return {
      success: true,
      error: {},
      data: students,
    };
    // eslint-disable-next-line
  } catch (err: any) {
    return {
      success: false,
      error: err?.toString(),
      data: [],
    };
  }
});
