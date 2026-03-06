import { FaCreditCard } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const BuyCreditsBtn = () => {
  const availableCredits = useSelector(state => state.advertsReplication.availableCredits);
  return !availableCredits ? (
    <Link className="btn btn-warning btn-lg" to="/creditos/comprar" style={{ float: "right" }}>
      <FaCreditCard />
      &nbsp; Comprar Créditos
    </Link>
  ) : (
    <></>
  );
};

export default BuyCreditsBtn;
