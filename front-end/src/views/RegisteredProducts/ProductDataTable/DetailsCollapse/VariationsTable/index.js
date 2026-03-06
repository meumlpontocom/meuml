import React               from "react";
import Table               from "../Table";
import PropTypes           from "prop-types";
import VariationList       from "./VariationList";
import variationsPropTypes from "./variationPropTypes";

function VariationsData({ editVariation, parentAttributes, variations }) {
  if (!variations?.length) return <></>;
  return (
    <>
      <h4 className="ml-2" style={{ color: "rgba(0, 0, 0, 0.6)" }}>Variações</h4>
      <Table
        tableHeader={
          <tr>
            <th>SKU</th>
            <th>Nome</th>
            <th>Atributos</th>
            <th></th>
          </tr>
        }
      >
        <VariationList
          parentAttributes={parentAttributes}
          editVariation={editVariation}
          variations={variations}
        />
      </Table>
    </>
  );
}

VariationsData.propTypes = {
  parentAttributes: variationsPropTypes,
  variations: variationsPropTypes,
  date_created: PropTypes.string,
  date_modified: PropTypes.string,
  description: PropTypes.string,
  has_expiration_date: PropTypes.bool,
  id: PropTypes.number.isRequired,
  images: PropTypes.array.isRequired,
  is_parent: PropTypes.bool,
  name: PropTypes.string.isRequired,
  parent_id: PropTypes.number,
  sku: PropTypes.string.isRequired,
  user_id: PropTypes.number,
};

export default VariationsData;
