import React, { useEffect, useMemo, useState }                           from "react";
import { fetchInventoryReports }                                         from "./request";
import { CButton, CCard, CCardBody, CCollapse, CDataTable, CPagination } from "@coreui/react";
import dateTimeFormat                                                    from "./dateTimeFormat";
import LoadingContainer                                                  from "./LoadingContainer";
import cDataTablesFields                                                 from "./cDataTablesFields";
import CDataTableStyles                                                  from "./CDataTablesStyles";
import OperationTypeBadge                                                from "./OperationTypeBadge";
import PageHeader                                                        from "../../components/PageHeader";
import formatMoney                                                       from "src/helpers/formatMoney";
import CallToAction                                                      from "src/views/CallToAction";

const InventoryReports = () => {
  const [error402, setError402] = useState(() => false);
  const [data, setData] = useState({});
  const [pagination, setPagination] = useState({ pages: 0, page: 0, limit: 50 });
  const [isLoading, setIsLoading] = useState(false);
  const cDataTablesItems = useMemo(() => Object.values(data), [data]);
  const toggleDetailsIsOpen = id => setData(
    _data => ({ ..._data, [id]: { ...data[id], isOpen: !data[id].isOpen } }),
  );

  function handleFetchReports(page = 1) {
    setIsLoading(true);
    fetchInventoryReports({ page })
      .then(response => {
        if (response.statusCode === 402) {
          setError402(true);
        } else {
          setPagination(response.meta);
          setData(() => {
            let _data_ = {};
            response.data.forEach(item => _data_[item.id] = {
              ...item,
              isOpen: false,
              sku: item.sku ?? "N/A",
              date_created: dateTimeFormat(item.date_created),
            });
            return _data_;
          });
        }
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    handleFetchReports();
  }, []);

  return error402 ? (
    <CallToAction />
  ) : (
    <>
      <PageHeader heading="Relatórios de Estoque" />
      <CCard className="card-accent-primary">
        <CCardBody>
          <LoadingContainer isLoading={isLoading}>
            <CDataTableStyles>
              <CDataTable
                underTableSlot={
                  <CPagination
                    pages={pagination.pages}
                    activePage={pagination.page}
                    limit={pagination.limit}
                    onActivePageChange={page => handleFetchReports(page)}
                  />
                }
                sorter
                responsive
                pagination
                itemsPerPage={50}
                fields={cDataTablesFields}
                items={cDataTablesItems}
                noItemsViewSlot={"Nenhum relatório disponível"}
                scopedSlots={{
                  operation_type: (item) => (
                    <td>
                      <OperationTypeBadge type={item.operation_type} />
                    </td>
                  ),
                  table_buttons: (item) => (
                    <td className="table-buttons">
                      <CButton
                        size="sm"
                        color="dark"
                        variant="outline"
                        onClick={() => toggleDetailsIsOpen(item.id)}
                      >
                        Detalhes
                      </CButton>
                    </td>
                  ),
                  details: (item) => (
                    <CCollapse show={item.isOpen} className="border-primary">
                      <CDataTable
                        items={[item]}
                        fields={[
                          { key: "warehouse_code", label: "Código do armazém" },
                          { key: "warehouse_name", label: "Nome do armazém" },
                          { key: "price", label: "Preço" },
                          { key: "order_status", label: "Status da ordem" },
                          { key: "marketplace_name", label: "Nome de marketplace" },
                        ]}
                        scopedSlots={{
                          price: tableData =>
                            <td>{tableData.price === null ? "N/A" : formatMoney(tableData.price)}</td>,
                          order_status: tableData => <td className="text-center">{tableData.order_status || "N/A"}</td>,
                          marketplace_name: tableData =>
                            <td className="text-center">{tableData.marketplace_name || "N/A"}</td>,
                        }}
                      />
                    </CCollapse>
                  ),
                }}
              />
            </CDataTableStyles>
          </LoadingContainer>
        </CCardBody>
      </CCard>
    </>
  );
};

export default InventoryReports;
