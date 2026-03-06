// React & Redux
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
// Reactstrap
import Col from "reactstrap/lib/Col";
import Input from "reactstrap/lib/Input";
import Collapse from "reactstrap/lib/Collapse";
import LoadingCardData from "../../../../../../components/LoadingCardData";
import fetchDescription from "./fetchDescription";

export default function AdvertDescription({ id }) {
  const dispatch = useDispatch();
  const [toggleDescription, setToggleDescription] = useState({});
  const [isLoadingDescription, setIsLoadingDescription] = useState(true);

  const { description } = useSelector((state) => {
    const { adverts } = state.advertsReplication;
    const advert = adverts.filter((advert) => advert.id === id);
    return advert[0];
  });

  const [newDescription, setNewDescription] = useState("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  function saveNewDescription() {
    if (newDescription !== description)
      dispatch({
        type: "REPLICATION_UPDATE_ADVERT_DESCRIPTION",
        payload: {
          id,
          value: { plain_text: newDescription },
          parameter: "description",
        },
      });
  }

  function handleCollpase() {
    if (description === null) {
      fetchDescription({ setIsLoadingDescription, setNewDescription, id }).then(() => {
        if (toggleDescription[id]) {
          saveNewDescription();
        }
      });
    }
    setToggleDescription({
      ...toggleDescription,
      [id]: !toggleDescription[id],
    });
  }

  return (
    <Col style={{ padding: "0px" }} xs={12} sm={8} md={7} lg={6}>
      <span className="text-muted">
        <i className="cil-short-text mr-1" />
        Descrição:{" "}
        <Collapse isOpen={toggleDescription[id]}>
          {isLoadingDescription ? (
            <LoadingCardData />
          ) : (
            <Input
              type="textarea"
              id="edit-description"
              name="edit-description"
              value={newDescription}
              onChange={({ target: { value } }) => setNewDescription(value)}
            />
          )}
        </Collapse>
        <span
          style={{ cursor: "pointer" }}
          className="text-primary"
          onClick={handleCollpase}
        >
          {toggleDescription[id] ? "[Salvar]" : "[Ver descrição original]"}
        </span>
      </span>
    </Col>
  );
}
