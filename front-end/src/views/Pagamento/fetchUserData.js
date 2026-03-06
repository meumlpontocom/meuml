import api from "src/services/api";
import { getToken } from "src/services/auth";

const fetchUserData = async ({ setUserSavedData }) => {
  await api
  .get("/client-data", {
    headers: { Authorization: `Bearer ${getToken()}` },
    })
    .then((response) => {
      if (response.data.status === "success") {
        setUserSavedData(response.data.data);
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

export default fetchUserData;
