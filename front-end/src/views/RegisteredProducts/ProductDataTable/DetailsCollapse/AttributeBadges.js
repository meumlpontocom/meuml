import React, { useMemo } from "react";
import PropTypes          from "prop-types";
import { CBadge }         from "@coreui/react";
import { v4 as uuidV4 }   from "uuid";

function AttributeBadges({ attributes }) {
  const attributeList = useMemo(() => {
    const createAttributeKey = (attribute) => ({
      ...attribute,
      key: uuidV4(),
    });
    return attributes ? attributes.map(createAttributeKey) : [];
  }, [attributes]);

  return attributeList.length ? (
    attributeList.map((attribute) => (
      <CBadge shape="pill" color="primary" className="mr-1" key={attribute.key}>
        {attribute.field}:&nbsp;{attribute.value}
      </CBadge>
    ))
  ) : (
    <></>
  );
}

AttributeBadges.propTypes = {
  attributes: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ),
};

export default AttributeBadges;
