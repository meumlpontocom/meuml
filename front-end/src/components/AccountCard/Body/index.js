import { CCardBody } from "@coreui/react";
import AccountAdverts from "./AccountAdverts";
import AccountEmail from "./AccountEmail";
import AccountFlexShipping from "./AccountFlexShipping";
import AccountName from "./AccountName";
import AccountSales from "./AccountSales";
import MShops from "./MShops";
import NoAuthenticationCard from "./NoAuthenticationCard";

export default function Body({ id }) {
  return (
    <CCardBody className="p-0 m-0">
      <NoAuthenticationCard id={id} />
      <div style={{ borderBottom: "1px solid #ddd" }}>
        <AccountSales id={id} />
        <AccountAdverts id={id} />
      </div>
      <div className="mx-0 mb-0 p-0 d-flex bg-white align-items-center border-details">
        <AccountEmail id={id} />
      </div>
      <div className="mx-0 mb-0 p-0 d-flex bg-white align-items-center border-details">
        <AccountName id={id} />
      </div>
      <div className="mx-0 mb-0 p-0 d-flex bg-white align-items-center rounded-bottom-left">
        <AccountFlexShipping id={id} />
      </div>
      <MShops id={id} />
    </CCardBody>
  );
}
