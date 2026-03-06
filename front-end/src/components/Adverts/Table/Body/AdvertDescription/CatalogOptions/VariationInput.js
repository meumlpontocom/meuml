import React from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Table } from 'reactstrap';

VariationInput.propTypes = {
  externalData: PropTypes.object
}

export default function VariationInput({ externalData, advertName }) {
  if (externalData.variations.length === 0) {
    return null;
  }

  return (
    <Col sm="12" md="12" lg="12" xs="12">
      <Card>
        <Table responsive>
          <thead style={{ fontSize: 12 }}>
            <tr>
              <th>
                <i className="cil-check" />
              </th>
              <th>
                Variação
                </th>
              <th>
                Item de Catálogo
                </th>
            </tr>
          </thead>
          <tbody style={{ fontSize: 10 }}>
            {externalData.variations.map((variation, index) => {
              let { eligible } = variation;
              return (
                <tr key={index}>
                  <td className="form-check">
                    {
                      eligible
                        ? <input type="checkbox" value={variation.id} id="checkBox" />
                        : <i className="cil-x" />
                    }
                  </td>
                  <td>
                    {variation.attributes.map(attribute => (
                      <Col sm="12" md="12" lg="12" xs="12">
                        <span>{attribute.name}: {attribute.value_name}</span>
                      </Col>
                    ))}
                  </td>
                  <td>{variation.catalog_product_name}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </Col>
  );
}
