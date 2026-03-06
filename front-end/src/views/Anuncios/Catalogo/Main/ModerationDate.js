/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Col, UncontrolledTooltip } from "reactstrap";

export default function ModerationDate({ id, moderationDate }) {
  const [moderation, setModeration] = useState(() => ({
    date: new Date(moderationDate).toLocaleDateString("pt-BR"),
    time: new Date(moderationDate).toLocaleTimeString("pt-BR"),
  }));

  return moderationDate ? (
    <Col style={{ padding: "0px" }} sm="12" xs="12" md="6" lg="6" xl="6">
      <UncontrolledTooltip placement="left" target={`moderation-date-${id}-text`}>
        Seu anúncio será moderado até {moderation.date} às {moderation.time} caso não seja incluído em um
        catálogo válido.
      </UncontrolledTooltip>
      <p className="text-danger" id={`moderation-date-${id}-text`}>
        <i className="cil-calendar mr-1" id={`moderation-date-${id}-icon`} />
        Data da moderação: {moderation.date} {moderation.time}
      </p>
    </Col>
  ) : (
    <></>
  );
}
