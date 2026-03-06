import React, { useEffect, useState } from "react";
import Swal                           from "sweetalert2";
import { CCol, CRow }                 from "@coreui/react";
import api                            from "../../services/api";
import { getToken }                   from "src/services/auth";
import LoadPageHandler                from "../../components/Loading";
import PageHeader                     from "../../components/PageHeader";
import AccountsList                   from "./AccountsList";
import CallToAction                   from "src/views/CallToAction";

const WarehouseDefaults = () => {
  const [error402, setError402] = useState(() => false);
  const [isLoading, setIsLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const header = {
    headers: { Authorization: `Bearer ${getToken()}` },
  };

  async function getAccountsAndWarehouses() {
    async function getWarehouses() {
      return await api.get("/warehouses", header);
    }

    async function getAccountsSummary() {
      return await api.get("/dashboard/summary", header);
    }

    try {
      await getWarehouses().then((res) => setWarehouses(res.data.data));
      await getAccountsSummary().then((res) =>
        setAccounts(res.data.data.subscriptions),
      );
    } catch (error) {
      if (error.response) {
        Swal.fire({
          title: "Atenção",
          html: `<p>${error.response.data.message}</p>`,
          type: error.response.data.status,
          showCloseButton: true,
        });
        if (error.response?.data?.statusCode === 402) {
          setError402(true);
        }
      } else {
        Swal.fire({
          title: "Atenção",
          html: `<p>${error.message ? error.message : error}</p>`,
          type: "error",
          showCloseButton: true,
        });
      }
      return error;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getAccountsAndWarehouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return error402 ? (
    <CallToAction />
  ) : (
    <LoadPageHandler
      isLoading={isLoading}
      render={
        <>
          <PageHeader heading="Armazém padrão" subheading="por conta" />
          <CRow>
            <CCol xl="7">
              <AccountsList warehouses={warehouses} accounts={accounts} />
            </CCol>
          </CRow>
        </>
      }
    />
  );
};

export default WarehouseDefaults;
