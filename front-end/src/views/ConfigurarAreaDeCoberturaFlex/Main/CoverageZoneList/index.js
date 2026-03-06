import React from "react";
import "./index.css";
import {
  Col,
  Row,
  ListGroup,
  ListGroupItem,
  ListGroupItemText,
  Input,
  ListGroupItemHeading,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { saveFlexShippingCoverageZone } from "../../../../redux/actions";

export default function CoverageZoneList({ col: { xs, sm, md, lg } }) {
  const dispatch = useDispatch();
  const coverageZones = useSelector((state) =>
    Object.values(state.flexShippingConfig.converageZoneConfig)
  );
  const updateZoneCoverageStore = (update) => {
    dispatch(saveFlexShippingCoverageZone(update));
  };

  const handleCheck = ({ checked, zoneId }) => {
    let updatedDataArray = [];
    for (const zone of coverageZones) {
      const { id } = zone;
      if (id === zoneId) updatedDataArray.push({ ...zone, selected: checked });
      else updatedDataArray.push({ ...zone });
    }
    updateZoneCoverageStore(updatedDataArray);
  };

  return (
    <Col xs={xs} sm={sm} md={md} lg={lg} className="list-group-column">
      <ListGroup className="list-group">
        {coverageZones.map(
          ({ id, is_mandatory, label, polygon, price, selected }, index) => {
            return (
              <ListGroupItem key={index}>
                <Row>
                  <Col>
                    <ListGroupItemHeading>{label}</ListGroupItemHeading>
                  </Col>
                  <Col>
                    <ListGroupItemText className="text-right">
                      <Input
                        id={id}
                        name={label}
                        type="checkbox"
                        checked={selected}
                        onChange={({ target: { checked, id } }) =>
                          handleCheck({ checked, zoneId: id })
                        }
                      />
                    </ListGroupItemText>
                  </Col>
                </Row>
              </ListGroupItem>
            );
          }
        )}
      </ListGroup>
    </Col>
  );
}
