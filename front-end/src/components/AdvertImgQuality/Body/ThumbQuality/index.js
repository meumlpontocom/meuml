import React, { useContext } from "react";
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import Card from "reactstrap/lib/Card";
import CardHeader from "reactstrap/lib/CardHeader";
import CardBody from "reactstrap/lib/CardBody";
import context from "../../imageQualityContext";

export default function ThumbQuality({ conditions, thumbnailImage }) {
  const { id, permalink } = useContext(context);
  return (
    <Col xs={12} sm={6} md={6} lg={6}>
      <Card>
        <CardHeader>
          <img
            className="card-img-top"
            src={thumbnailImage.secure_url}
            alt={`Thumbnail do anúncio ${id}`}
          />
        </CardHeader>
        <CardBody>
          <Row>
            <Col xs={12} className="mb-2">
              <h5 className="text-primary">
                Foto Principal do Anúncio (
                <a target="_blank" rel="noopener noreferrer" href={permalink}>
                  {id}
                </a>
                )
              </h5>
              <small className="text-muted">
                O Mercado Livre avalia a qualidade da imagem de capa do seu
                anúncio.
              </small>
            </Col>
            <Col xs={12}>
              <ul
                style={{
                  listStyle: "none",
                  paddingLeft: "0px",
                  marginBottom: "1rem",
                }}
                className="card-text text-left"
              >
                {conditions.length ? (
                  conditions.map(({ key, name, color, status }) => {
                    return (
                      <li key={key}>
                        <i className="cil-caret-right mr-1" />
                        <span>{name}</span>
                        <span className={`text-${color}`}>{status}</span>
                      </li>
                    );
                  })
                ) : (
                  <></>
                )}
              </ul>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Col>
  );
}
