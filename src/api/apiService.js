import axiosInstance from "./axiosInstance";

const apiService = async (httpMethod, url, reqBody = null, reqHeader = {}) => {
  const reqConfig = {
    method: httpMethod,
    url,
    headers: reqHeader,
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