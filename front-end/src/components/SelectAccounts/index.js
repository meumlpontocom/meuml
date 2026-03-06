import { useMemo } from "react";
import { Picky } from "react-picky";
import { useSelector } from "react-redux";

export default function SelectAccounts({
  platform = "ML",
  callback,
  selected,
  placeholder,
  dropdownHeight = 600,
  includeFilter = true,
  includeSelectAll = true,
  multipleSelection = true,
  disabled = false,
}) {
  const { accounts } = useSelector(state => state.accounts);

  const accountList = useMemo(() => {
    return Object.values(accounts).filter(
      account => account.internal_status === 1 && account.platform === platform,
    );
  }, [accounts, platform]);

  return (
    <Picky
      id="select-account-dropdown"
      onChange={callback}
      value={selected}
      options={accountList}
      open={false}
      multiple={multipleSelection}
      labelKey="name"
      valueKey="id"
      includeFilter={includeFilter}
      dropdownHeight={dropdownHeight}
      includeSelectAll={includeSelectAll}
      placeholder={placeholder}
      selectAllText="Selecionar Todos"
      filterPlaceholder="Filtrar por..."
      allSelectedPlaceholder="Todos (%s)"
      manySelectedPlaceholder="%s Selecionados"
      disabled={disabled}
    />
  );
}
