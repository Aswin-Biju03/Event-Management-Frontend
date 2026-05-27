import axiosInstance from "./axiosInstance";

const apiService = async (httpMethod, url, reqBody = null, reqHeader = {}) => {
  const reqConfig = {
    method: httpMethod,
    url,
    data: reqBody,
    headers: reqHeader,
  };
  try {
    const response = await axiosInstance(reqConfig);
    return response;
  } catch (err) {
    throw err; // ✅ properly propagates error to the caller
  }
};

export default apiService;