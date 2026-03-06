import React, { useContext } from "react";
import { Col, Row } from "reactstrap";
import PlanContext from "../context";
import NavPersonal from "./NavPersonal";
import OptionPersonal from "./OptionPersonal";
import { BoxPersonal, HeaderCustom } from "./styles";

export default function PlanoPersonalizado() {
  const { plans, setPlans } = useContext(PlanContext);

  function handleActive(value) {
    const { id } = plans[value];

    setPlans({
      ...plans,
      packageId: id,
      selected: plans.selected.map((item) =>
        plans[value].array.find((select) => item.id === select.id)
          ? { ...item, checked: true, disabled: true }
          : { ...item, checked: false, disabled: false }
      ),
      planSelect: value,
    });
  }

  return (
    <BoxPersonal>
      <Row className="header-person mb-2">
        {plans.packages.map((pack) => (
          <HeaderCustom
            xs={2}
            key={pack.id}
            id={pack.id}
            onClick={() => handleActive(pack.title)}
            active={plans.planSelect === pack.title ? 1 : 0}
          >
            {pack.title}
          </HeaderCustom>
        ))}
      </Row>
      <Row>
        <Col xs={8} className="mr-2">
          <OptionPersonal />
        </Col>
        <Col style={{ paddingRight: "5px" }}>
          <NavPersonal />
        </Col>
      </Row>
    </BoxPersonal>
  );
}
