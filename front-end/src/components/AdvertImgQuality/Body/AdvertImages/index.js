import React from "react";
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import Card from "reactstrap/lib/Card";
import CardHeader from "reactstrap/lib/CardHeader";
import CardBody from "reactstrap/lib/CardBody";

export default function AdvertImages({ pictures }) {
  return pictures
    .filter((img) => img !== {} && img?.id !== "undefined")
    .map((advertImage, index) => {
      return (
        <Row>
          <Col xs={12} sm={3} md={3} lg={3} key={index}>
            <Card className={advertImage.error ? "border-danger" : ""}>
              <CardHeader>
                <img
                  className="card-img-top"
                  src={advertImage.secure_url}
                  alt={`Image_${advertImage.id}`}
                />
              </CardHeader>
              <CardBody>
                <ul
                  style={{
                    listStyle: "none",
                    paddingLeft: "0px",
                    marginBottom: "1rem",
                  }}
                  className="card-text text-left"
                >
                  <li>
                    <i className="cil-caret-right mr-1" />
                    <span>Resolução: </span>
                    <span className="text-info">{advertImage.size}</span>
                  </li>
                  {advertImage.quality ? (
                    <li>
                      <i className="cil-caret-right mr-1" />
                      <span>Qualidade: </span>
                      <span
                        className={
                          advertImage.quality === "Ruim"
                            ? "text-danger"
                            : advertImage.quality === "Boa"
                            ? "text-success"
                            : "text-warning"
                        }
                      >
                        {advertImage.quality}
                      </span>
                    </li>
                  ) : (
                    <></>
                  )}
                  {advertImage.error ? (
                    <li>
                      <i className="cil-caret-right mr-1" />
                      {advertImage.error}
                    </li>
                  ) : (
                    <></>
                  )}
                </ul>
              </CardBody>
            </Card>
          </Col>
        </Row>
      );
    });
}
