const cDataTablesFields = [
  {
    key: "operation_type",
    label: "Entrada/Saída",
    _classes: "in-out",
    _style: { width: "10%" },
  },
  {
    key: "sku",
    label: "SKU",
    _classes: "table-sku",
    _style: { width: "10%" },
  },
  { key: "name", label: "Nome", _style: { width: "50%" } },
  { key: "quantity", label: "Quantidade" },
  { key: "date_created", label: "Data" },
  {
    key: "table_buttons",
    label: "",
    _style: { width: "1%" },
    sorter: false,
    filter: false,
  },
];

export default cDataTablesFields;
