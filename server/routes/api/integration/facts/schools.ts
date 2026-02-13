import axios from "axios";

export default eventHandler(async (event) => {
  try {
    const postedParameters = await readBody(event);

    if (!postedParameters?.baseUrl) {
      throw new Error("baseUrl is required");
    }

    const pageSize = postedParameters?.pageSize || 10;

    const customHeaders = postedParameters?.headers || {};

    const response = await axios.get(`/SchoolConfigurations`, {
      baseURL: postedParameters.baseUrl,
      headers: {
        ...customHeaders,
      },
      params: {
        PageSize: pageSize,
        'api-version': '1'
      }
    });

    return {
      success: true,
      error: {},
      data: response?.data || [],
    };

  } catch (err) {
    return {
      success: false,
      error: err?.toString(),
      data: [],
    };
  }
});
