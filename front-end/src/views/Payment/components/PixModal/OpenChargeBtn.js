import { FaLink }  from "react-icons/fa";

function OpenChargeBtn() {
  return (
    <a className="btn btn-outline-success btn-block" target="_blank" rel="noreferrer" href={localStorage.getItem("@MeuML-PaymentURL")}>
      <FaLink className="mb-1" />
      &nbsp;Abrir fatura
    </a>
  );
}

export default OpenChargeBtn;
