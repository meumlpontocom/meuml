import React     from "react";
import Badge     from "./Badge";
import PropTypes from "prop-types";

const Badges = ({ promotions, togglePopUpOpen, setSelectedPromotion }) => {
  const handleSelectPromotion = promotion => {
    togglePopUpOpen(true);
    setSelectedPromotion(promotion);
  }
  return promotions 
    ? promotions.map(promo => (
      <Badge
        key={promo.id}
        status={promo.status}
        promoType={promo.promotion_type}
        promoTypeName={promo.promotion_type_name}
        onClick={() => handleSelectPromotion(promo)}
      />
    )
  ) : <></>;
};

export default Badges;

Badges.propTypes = {
  promotions: PropTypes.array,
  togglePopUpOpen: PropTypes.func.isRequired
};
