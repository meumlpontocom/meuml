const dataTableFields = [
  {
    key: "sku",
    label: "SKU",
    _classes: "table-sku",
    _style: { width: "20%" },
  },
  { key: "name", label: "Nome", _style: { width: "60%" } },
  {
    key: "table_buttons",
    label: "",
    _style: { width: "1%" },
    sorter: false,
    filter: false,
  },
];

export default dataTableFields;
