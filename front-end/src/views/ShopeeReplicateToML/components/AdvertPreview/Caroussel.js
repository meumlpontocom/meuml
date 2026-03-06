import React, { useContext, useMemo, useState } from "react";
import { CButton, CCol, CRow }                  from "@coreui/react";
import shopeeReplicateToMLContext               from "../../shopeeReplicateToMLContext";
import { FaArrowLeft, FaArrowRight }            from "react-icons/fa";

const Caroussel = () => {
  const { form } = useContext(shopeeReplicateToMLContext);
  const [showPicture, setShowPicture] = useState(() => 0);

  const handleNextPictureClick = () => setShowPicture(c => c < pictures.length - 1 ? c + 1 : 0);
  const handlePreviousPictureClick = () => setShowPicture(c => c > 0 ? c - 1 : pictures.length - 1);

  const pictures = useMemo(() => {
    return form.basic.pictures_shopee.length
      ? form.basic.pictures_shopee.map((picture, idx) => ({
        url: picture, id: idx,
      }))
      : form.basic.pictures
        ? Array.from(form.basic.pictures).map((picture, idx) => ({
          url: URL.createObjectURL(picture), id: idx,
        }))
        : [];
  }, [form.basic.pictures, form.basic.pictures_shopee]);

  return (
    <CRow>
      <CCol xs={12} className="text-center">
        {pictures.map(picture => showPicture !== picture.id ? <></> : (
          <img
            width={300}
            id={picture.id}
            alt={picture.url}
            key={picture.id}
            src={picture.url}
          />))}
      </CCol>
      <CCol>
        <CRow className="d-flex align-items-center justify-content-between">
          <CCol
            xs={12}
            className="d-flex flex-row justify-content-between mb-3"
          >
            {pictures.map((picture, idx) => (
              <div
                style={{ height: "3px", width: "100%", margin: "3px", }}
                className={showPicture === idx ? "bg-primary" : "bg-secondary"}
                key={idx}
              />
            ))}
          </CCol>
          <CCol xs={6}>
            <CButton
              color="dark"
              size="sm"
              variant="outline"
              block
              onClick={handlePreviousPictureClick}
            >
              <FaArrowLeft />
            </CButton>
          </CCol>
          <CCol xs={6}>
            <CButton
              color="dark"
              size="sm"
              variant="outline"
              block
              onClick={handleNextPictureClick}
            >
              <FaArrowRight />
            </CButton>
          </CCol>
        </CRow>
      </CCol>
    </CRow>
  );
};

export default Caroussel;
