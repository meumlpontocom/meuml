import React from "react";
import Col from "reactstrap/lib/Col";

export default function ThumbWithTitle({ secureThumbnail, title, id }) {
  return (
    <Col className="mb-0 mb-md-5">
      <div className="d-sm-flex">
        <div className="flex-shrink-1 py-sm-2 text-center mr-2">
          <img src={secureThumbnail} alt="Capa do anúncio" />
        </div>
        <div className="d-flex flex-column justify-content-center">
          <p className="text-primary h4 mb-0">{title}</p>
          <p className="h5">
            <small>{id}</small>
          </p>
        </div>
      </div>
    </Col>
  );
}
