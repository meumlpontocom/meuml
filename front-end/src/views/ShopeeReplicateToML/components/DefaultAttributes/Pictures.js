import React, { useCallback, useContext, useEffect, useState } from "react";
import Container                                               from "./Container";
import { CCol, CLabel, CInput, CSwitch }                       from "@coreui/react";
import { useHistory }                                          from "react-router-dom";
import styled                                                  from "styled-components";
import shopeeReplicateToMLContext                              from "../../shopeeReplicateToMLContext";

const Col = styled(CCol)`
  padding-left: 0;
`;

const Pictures = ({ handleFormChange }) => {
  const history = useHistory();
  const { form } = useContext(shopeeReplicateToMLContext);
  const [useShopees, setUseShopees] = useState(() => true);
  const handleUseShopeeChange = useCallback(() => {
    setUseShopees(c => !c);
  }, [setUseShopees]);
  useEffect(() => {
    if (useShopees) {
      form.basic.pictures?.length && handleFormChange({
        target: {
          id: "pictures",
          files: [],
        },
      });
      !form.basic.pictures_shopee?.length && handleFormChange({
        target: {
          id: "pictures_shopee",
          value: history.location.state.images,
        },
      });
    } else form.basic.pictures_shopee?.length && handleFormChange({
      target: {
        id: "pictures_shopee",
        value: [],
      },
    });
  }, [useShopees, history, form, handleFormChange]);
  return (
    <Container col={{ xs: 12, className: "mb-3" }} label="Imagens">
      <Col>
        <CLabel htmlFor="useShopees" className="mt-2 d-flex align-items-center">
          <CSwitch
            color="info"
            id="useShopees"
            name="useShopees"
            checked={useShopees}
            onChange={handleUseShopeeChange}
          />
          <span>&nbsp;Utilizar imagens da Shopee?</span>
        </CLabel>
      </Col>
      {useShopees
        ? !form.basic.pictures_shopee?.length ? <></> : (
          <div className="d-flex flex-wrap">
            {form.basic.pictures_shopee.map((picture, idx) => (
              <div
                className="d-flex align-items-center justify-content-center mr-3 mb-3"
                key={`${picture}${idx}`}
              >
                <img
                  src={picture}
                  alt={picture}
                  className="img-fluid"
                  width={90}
                />
              </div>
            ))}
          </div>
        ) : (
          <Col>
            <CInput
              id="pictures"
              name="pictures"
              type="file"
              className="form-control-file mt-3 mb-3"
              multiple
              files={form.basic.pictures}
              onChange={handleFormChange}
              placeholder="Imagens do produto"
            />
            {!form.basic.pictures?.length ? <></> : (
              <div className="d-flex flex-wrap">
                {Array.from(form.basic.pictures).map((picture, idx) => (
                  <div
                    className="d-flex align-items-center justify-content-center mr-3 mb-3"
                    key={`${picture.name}${idx}`}
                  >
                    <img
                      src={URL.createObjectURL(picture)}
                      alt={picture.name}
                      className="img-fluid"
                      width={90}
                    />
                  </div>
                ))}
              </div>
            )}
          </Col>
        )}
    </Container>
  );
};

export default Pictures;
