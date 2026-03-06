export default function createShopeeFilterQuery(filters) {
  const statusFilter = filters.status?.length
    ? "status=" + filters.status.map(status => status.value) + "&"
    : "";

  const conditionsFilter = filters.condition?.length
    ? "condition=" + filters.condition.map(condition => condition.value) + "&"
    : "";

  const stringFilter = filters.string
    ? "filter_string=" + filters.string + "&"
    : "";

  const accountsFilter = filters.accounts?.length
    ? "filter_account=" + filters.accounts + "&"
    : "";

  const stockFilter = filters.stock?.value ? "stock=1&" : "";

  const filtersString = `${statusFilter}${conditionsFilter}${stringFilter}${accountsFilter}${stockFilter}`;

  return filtersString;
}
