import React from "react";

const ItemUnit = ({ thumbnail, title, externalId }) => {
  return (
    <div className="item-unit d-flex">
      <div className="item-unit-picture">
        {thumbnail ? (
          <img width={50} className="mr-2" src={thumbnail} alt="Capa" />
        ) : (
          <></>
        )}
      </div>
      <div className="item-unit-descr h-100">
        <p className="salescard-body-title mb-0">{title}</p>
        <p className="mb-0">{externalId}</p>
      </div>
    </div>
  );
};

export default ItemUnit;
