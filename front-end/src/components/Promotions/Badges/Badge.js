import React           from "react";
import Icon            from "./Icon";
import Status          from "./Status";
import StylesContainer from "./BadgesStyle";

const Badge = ({ status, onClick, promoType, promoTypeName }) => {
  const isPromotionActive = React.useMemo(() => status === "active", [status]);
  return (
    <StylesContainer active={isPromotionActive} promotionsType={promoType} onClick={onClick}>
      <div className="badge-icon" />
      <Status active={isPromotionActive} />
      <span className="badge-name">{promoTypeName}</span>
      <Icon promotionsType={promoType} />
    </StylesContainer>
  );
}

export default Badge;
