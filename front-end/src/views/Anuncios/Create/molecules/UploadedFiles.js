import React                from "react";
import PropTypes            from "prop-types";
import { CImg, CRow, CCol } from "@coreui/react";
import styled               from "styled-components";
import RemovePictureBtn        from "../atoms/RemovePictureBtn";

const Wrapper = styled(CRow)`
  position: relative;
  margin-bottom: 25px;

  .carouselContainer {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
  }

  .carouselContainer .carouselItem {
    flex-grow: 0;
    flex-shrink: 0;
    max-width: 100%;
  }
`;

const UploadedFiles = ({ images }) => {
  return !images?.length ? <></> : (
    <Wrapper>
      <div className="carouselContainer">
        {images.map(file => (
          <CCol xs="12" sm="3" md="4" className="mb-3 carouselItem" key={file.name}>
            <CRow>
              <CImg
                height="100%"
                width="100%"
                alt="thumbnail"
                src={URL.createObjectURL(file)}
                className="card-img border-secondary"
              />
              <RemovePictureBtn file={file}/>
            </CRow>
          </CCol>
        ))}
      </div>
    </Wrapper>
  );
};

UploadedFiles.propTypes = {
  images: PropTypes.array.isRequired,
};

export default UploadedFiles;
