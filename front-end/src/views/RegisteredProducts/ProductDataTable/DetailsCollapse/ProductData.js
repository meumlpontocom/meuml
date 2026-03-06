import React, { useMemo } from "react";
import Table              from "./Table";
import parseDate          from "./parseDate";
import PropTypes          from "prop-types";
import AttributeBadges    from "./AttributeBadges";

export default function ProductData({
  images,
  variations,
  attributes,
  description,
  dateModified,
}) {
  const thumb = useMemo(() => {
    if (images) return images[0].thumbnail_url;
    else if (variations && variations[0]?.images)
      return variations[0]?.images[0]?.thumbnail_url;
    else return null;
  }, [images, variations]);
  return (
    <Table
      size="sm"
      variant="primary"
      tableHeader={
        <tr>
          <th>Capa</th>
          <th>Descrição</th>
          <th>Última atualização</th>
          {attributes?.length && <th>Atributos</th>}
        </tr>
      }
    >
      <tr>
        <td style={{ width: "160px" }}>
          {thumb ? (
            <img
              src={`https://${thumb}`}
              alt="thumbnail"
              height="140"
              width="140"
            />
          ) : (
            <h5 className="text-center text-info">Sem imagens</h5>
          )}
        </td>
        <td style={{ maxWidth: "450px" }}>{description}</td>
        <td>{parseDate(dateModified)}</td>
        {attributes?.length && (
          <td style={{ maxWidth: "120px" }}>
            <AttributeBadges attributes={attributes} />
          </td>
        )}
      </tr>
    </Table>
  );
}

ProductData.propTypes = {
  attributes: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ),
  description: PropTypes.string,
  dateModified: PropTypes.string,
};
