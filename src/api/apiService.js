import axiosInstance from "./axiosInstance";

const apiService = async (httpMethod, url, reqBody = null, reqHeader = {}) => {
  const reqConfig = {
    method: httpMethod,
    url,
    headers: reqHeader,
    // ✅ Only attach data if body exists — fixes Express 5 JSON parse crash on DELETE
    ...(reqBody !== null && { data: reqBody }),
  };
  try {
    const response = await axiosInstance(reqConfig);
    return response;
  } catch (err) {
    throw err;
  }
};

export default apiService;