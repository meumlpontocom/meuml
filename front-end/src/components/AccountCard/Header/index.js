import { CCardHeader, CCol, CRow } from "@coreui/react";
import AccountNickname from "./AccountNickname";
import AccountStatus from "./AccountStatus";
import AccountThumbnail from "./AccountThumbnail";
import CardMenu from "./CardMenu";
import PlatformTag from "./PlatformTag";

export default function Header({ account }) {
  return (
    <CCardHeader>
      <CRow>
        <CCol xs={12}>
          <CRow style={{ float: "right", gap: "8px" }}>
            <PlatformTag id={account.id} />
            <CardMenu id={account.id} platform={account.platform} />
          </CRow>
        </CCol>
        <div className="d-block img-container my-2">
          <AccountStatus id={account.id} className="float-left" />
          <AccountThumbnail id={account.id} />
        </div>
        <AccountNickname id={account.id} />
      </CRow>
    </CCardHeader>
  );
}
