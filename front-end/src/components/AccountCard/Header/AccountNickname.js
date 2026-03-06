import { CCol } from "@coreui/react";
import { useSelector } from "react-redux";

export default function AccountNickname({ id }) {
  const name = useSelector(({ accounts: { accounts } }) => accounts[id]?.name || accounts[id]?.shop_name);
  return (
    <CCol xs={12}>
      <div className="text-primary text-center account-nickname mt-1 mb-0" title="apelido">
        <h2 id={`account-name-${id}`}>{name}</h2>
        <p className="id-account">{id}</p>
      </div>
    </CCol>
  );
}
