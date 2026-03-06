import { CButton }            from '@coreui/react';
import React                  from 'react'
import AttributeBadges        from '../AttributeBadges';
import variationsPropTypes    from './variationPropTypes';

const VariationList = ({ editVariation, variations, parentAttributes }) => {
    const removeParentAttributesFromList = (variationAttributeList) => {
      return !parentAttributes ? variationAttributeList : variationAttributeList.reduce((notParentAttributes, variationAttribute) => {
        const checkAttributeHeritage = (parentAttribute) => parentAttribute.value === variationAttribute.value;
        const isOnParentAttributeList = parentAttributes.filter(checkAttributeHeritage).length;
        return isOnParentAttributeList ? notParentAttributes : [...notParentAttributes, variationAttribute];
      },[]);
    };

    return variations.map((variation) => (
      <tr key={variation.id}>
        <td>{variation.sku}</td>
        <td>{variation.name}</td>
        <td>
          <AttributeBadges attributes={removeParentAttributesFromList(variation.attributes)} />
        </td>
        <td>
          <CButton color="warning" variant="outline" size="sm" onClick={() => editVariation(variation, "isEditing")}>
            Editar variação
          </CButton>
        </td>
      </tr>
    ));
  };

VariationList.propTypes = {
    parentAttributes: variationsPropTypes,
    variations: variationsPropTypes,
}

export default VariationList

