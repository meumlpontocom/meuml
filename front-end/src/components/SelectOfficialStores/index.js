import { useMemo } from "react";
import { Picky } from "react-picky";
import { useSelector } from "react-redux";
import Loading from "react-loading";

export default function SelectOfficialStores({
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
  const accountsOfficialStores = useSelector(state => state.advertsReplication.accountsOfficialStores);
  const isLoadingAccountsOfficialStores = useSelector(
    state => state.advertsReplication.isLoadingAccountsOfficialStores,
  );

  const officialStores = !!accountsOfficialStores?.length ? accountsOfficialStores[0].official_stores : [];

  const selectedObjectValues = Object.values(selected);
  const selectedValue = selectedObjectValues.length > 0 ? selectedObjectValues[0] : null;

  const selectedObject = selectedValue ? officialStores.find(stores => stores.id === selectedValue) : null;

  return (
    <div>
      <Picky
        id="select-official-store-dropdown"
        onChange={callback}
        value={selectedObject}
        options={officialStores}
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

      {isLoadingAccountsOfficialStores && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#eee",
            display: "flex",
            justifyContent: "center",
            opacity: 0.7,
            paddingTop: "5px",
          }}
        >
          <Loading type="bars" color={"#054785"} height={10} width={25} />
        </div>
      )}
    </div>
  );
}
