import React from "react";
import Col from "reactstrap/lib/Col";
import { useSelector } from "react-redux";

export default function PublishingErrors() {
  const { errors } = useSelector((state) => state.highQualityAdvert);
  return errors?.length ? (
    <Col xs="12">
      <p className="border-top">
        <p className="h5">Erros da publicação:</p>
        <ul>
          {[...new Set(errors)].map((error, index) => {
            return (
              <li className="text-danger" key={index}>
                <TranslatedError
                  errorDetail={error.detail}
                  errorPointer={error.source.pointer}
                />
              </li>
            );
          })}
        </ul>
      </p>
    </Col>
  ) : (
    <></>
  );
}

function TranslatedError({ errorPointer, errorDetail }) {
  const errorPointerSlashSplited = errorPointer.split("/");
  const errorSubject = errorPointerSlashSplited.length
    ? errorPointerSlashSplited[
        errorPointerSlashSplited.length - 1
      ].toUpperCase()
    : null;
  const error = `[${errorSubject}] ${errorDetail}`;
  switch (error) {
    case "[DESCRIPTION] Field may not be null.":
      return <span>O anúncio deve conter uma descrição!</span>;

    default:
      return <span>{error || ""}</span>;
  }
}
