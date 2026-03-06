import React from "react";

const ImagesStrip = ({ items }) => {
  return (
    <div
      style={{ width: "100%", overflowY: "auto", height: "100px" }}
      className="d-flex flex-row"
    >
      {items?.map((pic, index) => {
        return (
          <img
            width="80"
            height="80"
            src={pic.src}
            alt="texto da imagem"
            key={index}
            className="mx-1"
          />
        );
      })}
    </div>
  );
};

export default ImagesStrip;
