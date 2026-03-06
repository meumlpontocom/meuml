import { useContext } from "react";
import { Picky } from "react-picky";
import shopeeReplicateToMLContext from "../shopeeReplicateToMLContext";
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
  const { accountsOfficialStores, loadingOfficialStores } = useContext(shopeeReplicateToMLContext);
  const officialStores = !!accountsOfficialStores?.length ? accountsOfficialStores[0].official_stores : [];

  return (
    <div style={{ position: "relative" }}>
      <Picky
        id="select-official-store-dropdown"
        onChange={callback}
        value={selected}
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

      {loadingOfficialStores && (
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
