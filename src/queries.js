// src/utils/fetchDatas.js
import axios from "axios";

export const fetchDatas = async ({ userId }) => {
  try {
    const response = await axios.post(
      "/api/datas",
      { userId },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.data?.success) {
      return response.data.datas;
    } else {
      throw new Error("No data available");
    }
  } catch (error) {
    console.error("API call failed:", error);
    throw new Error("Failed to fetch data");
  }
};

// src/utils/fetchDatas.js
export const fetchMarkers = async ({ userId }) => {
  try {
    const response = await axios.post(
      "/api/fetch_markers", // Confirm this matches the API route file path
      { userId },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.data?.success) {
      return response.data.datas; // Ensure this matches the response structure
    } else {
      throw new Error("No data available");
    }
  } catch (error) {
    console.error("API call failed:", error);
    throw new Error("Failed to fetch data");
  }
};
