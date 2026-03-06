import React, { useMemo, useState, useEffect, useContext } from "react";
import CardBody from "reactstrap/lib/CardBody";
import LoadPageHandler from "../../Loading";
import AdvertImages from "./AdvertImages";
import ThumbQuality from "./ThumbQuality";
import Row from "reactstrap/lib/Row";
import context from "../imageQualityContext";
import AdvertData from "./AdvertData";

export default function Body() {
  const [thumbnailImage, setThumbnailImage] = useState({});
  const [advertImages, setAdvertImages] = useState([]);
  const {
    id,
    isLoading,
    thumbnailConditions,
    pictures,
    secureThumbnail,
  } = useContext(context);

  useEffect(() => {
    setThumbnailImage(pictures[0]);
    let update = [...pictures];
    update.shift();
    setAdvertImages(update);
  }, [pictures]);

  const conditions = useMemo(() => {
    return thumbnailConditions?.length
      ? thumbnailConditions.map((condition, index) => {
          switch (condition.id) {
            case "white_background":
              return {
                name: "Fundo branco: ",
                status: condition.passed ? "OK" : "Reprovado",
                key: index,
                color: condition.passed ? "success" : "danger",
              };
            case "minimum_size":
              return {
                name: "Resolução mínima: ",
                status: condition.passed ? "OK" : "Reprovado",
                key: index,
                color: condition.passed ? "success" : "danger",
              };
            case "blur":
              return {
                name: "Borrada: ",
                status: condition.passed ? "OK" : "Reprovado",
                key: index,
                color: condition.passed ? "success" : "danger",
              };
            case "border":
              return {
                name: "Borda: ",
                status: condition.passed ? "OK" : "Reprovado",
                key: index,
                color: condition.passed ? "success" : "danger",
              };
            case "logo_text_watermark":
              return {
                name: "Logo / Marca D'agua / Texto: ",
                status: condition.passed ? "OK" : "Reprovado",
                key: index,
                color: condition.passed ? "success" : "danger",
              };
            case "unprofessional_photo":
              return {
                name: "Foto não profissional: ",
                status: condition.passed ? "OK" : "Reprovado",
                key: index,
                color: condition.passed ? "success" : "danger",
              };
            default:
              return {
                name: "Atributo não identificado: ",
                status: condition.passed ? "OK" : "Reprovado",
                key: index,
                color: condition.passed ? "success" : "danger",
              };
          }
        })
      : [];
  }, [thumbnailConditions]);

  return (
    <CardBody>
      <LoadPageHandler
        isLoading={isLoading}
        render={
          conditions.length ? (
            <>
              <Row>
                <AdvertData />
                <ThumbQuality
                  advertId={id}
                  secureThumbnail={secureThumbnail}
                  thumbnailImage={thumbnailImage}
                  conditions={conditions}
                />
              </Row>
              <AdvertImages pictures={advertImages} />
            </>
          ) : (
            <>
              <p className="text-danger">
                O Mercado Livre não possui dados suficientes para este anúncio.
              </p>
            </>
          )
        }
      />
    </CardBody>
  );
}
