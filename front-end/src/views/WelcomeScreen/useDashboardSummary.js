import { useState,  useEffect } from "react";
import Swal                     from "sweetalert2";
import api                      from "src/services/api";
import { getToken, USER_NAME }  from "src/services/auth";

function useDashboardSummary() {
  const [isLoading, setIsLoading]               = useState(true);
  const [dashboardSummary, setDashboardSummary] = useState(null);

  async function getDashboardSummary() {
    setIsLoading(true);
    return await api.get("/dashboard/summary", {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  }

  useEffect(() => {
    getDashboardSummary()
      .then(res => {
        setDashboardSummary(res.data.data);
        localStorage.setItem(USER_NAME, res.data?.data?.user?.name);
      })
      .catch(error => {
        if (error) {
          Swal.fire({
            title: "Ops!",
            html: `<p>${error.response ? error.response.data.message : error}</p>`,
            type: "error",
            showCloseButton: true,
          });
        }
      })
      .finally(setIsLoading(false));
  }, []);
  
  return { isLoading, dashboardSummary };
}

export default useDashboardSummary;
