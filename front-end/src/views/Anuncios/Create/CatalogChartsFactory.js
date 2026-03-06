import { fetchCatalogCharts, fetchRequiredCategoryAttributes } from "../CatalogCharts/requests";

class CatalogChartsFactory {
  constructor({ selectedAccounts, domainId }) {
    this.selectedAccounts = selectedAccounts;
    this.domainId = domainId;
    this.requiredAttributes = [];
    this.payload = {
      account_id: selectedAccounts ? selectedAccounts[0]?.id : null,
      domain_id: domainId,
      attributes: this.requiredAttributes,
    };
  }

  charts = null;

  static shouldUpdateRequiredAttributes(requiredAttributes) {
    return !requiredAttributes?.length;
  }

  static async getRequiredAttributes(requiredAttributes, domainId) {
    if (CatalogChartsFactory.shouldUpdateRequiredAttributes(requiredAttributes) && domainId) {
      return await fetchRequiredCategoryAttributes({ selectedCategory: domainId });
    }

    return true;
  }

  static findAttributeInList(attributeList, targetAttribute) {
    return attributeList.filter(formAttribute => formAttribute.id === targetAttribute.id);
  }

  static fillInRequiredAtributtes(attributes, requiredAttributes) {
    return requiredAttributes?.length ? requiredAttributes.map(requiredAttribute => {
      const attributesFormValue = CatalogChartsFactory.findAttributeInList(attributes, requiredAttribute)[0];
      return {
        id: requiredAttribute.id,
        value_id: attributesFormValue?.value_id || "",
        value_name: attributesFormValue?.value_name || "",
      };
    }) : attributes;
  }

  static shouldFetchCatalogCharts(requiredAttributes) {
    return requiredAttributes.reduce(
      (error, attribute) => (error ? error : attribute.value_id && attribute.value_name),
      false,
    );
  }

  async saveAttributes(attributes) {
    const requiredAttributes = await CatalogChartsFactory.getRequiredAttributes(this.requiredAttributes, this.domainId);
    return CatalogChartsFactory.fillInRequiredAtributtes(attributes, requiredAttributes);
  }

  async fetchCatalogCharts() {
    if (CatalogChartsFactory.shouldFetchCatalogCharts(this.requiredAttributes)) {
      return await fetchCatalogCharts({ payload: this.payload });
    }
  }
}

export default CatalogChartsFactory;
