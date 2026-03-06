import React, { useMemo } from "react";
import Main from "./Main";
import Col from "reactstrap/lib/Col";
import { useSelector } from "react-redux";

export default function AdvertImgCarousel() {
  const {
    advertData,
    form: { pictures },
  } = useSelector((state) => state.editAdvert);

  const images = useMemo(() => {
    const formImageListLength = pictures.length;
    return formImageListLength ? pictures : advertData.pictures || [];
  }, [pictures, advertData.pictures]);

  return (
    <Col
      xs="12"
      sm="12"
      md="8"
      lg="8"
      xl="8"
      style={{ width: "300px" }}
      className="p-1 pr-2 mb-3"
    >
      <Main
        accountId={advertData.seller_id}
        items={images.map((pic, index) => ({
          src: pic.secure_url,
          altText: "Imagem do anúncio",
          captionHeader: pic.quality ? `Qualidade: ${pic.quality}` : "",
          captionText: pic.size ? `Tamanho: ${pic.size}` : "",
          key: index,
        }))}
      />
    </Col>
  );
}
