import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSelector }                                                  from "react-redux";
import { CCard, CCardBody, CCardHeader }                                from "@coreui/react";
import CatalogChartSelect                                               from "./CatalogChartsSelect";
import { createMlAdvertContext }                                        from "../createMlAdvertContext";
import CatalogChartsAlert                                               from "../atoms/CatalogChartsAlert";
import { fetchCatalogCharts, fetchRequiredCategoryAttributes }          from "../../CatalogCharts/requests";
import CatalogChartsSelectRow                                           from "../atoms/CatalogChartsSelectRow";

const CatalogCharts = () => {
  const { setFormData, form, categoryTree } = useContext(createMlAdvertContext);

  const visibleAttributeList = useMemo(
    () => categoryTree.filter(attribute => !attribute.tags["hidden"]),
    [categoryTree],
  );

  // Start charts required attributes
  const [inactiveDomain, setInactiveDomain] = useState(false);
  const [requiredAttributes, setRequiredAttributes] = useState([]);
  const domainId = useMemo(() => form.selectedCategory.domain_id, [form.selectedCategory.domain_id]);
  const isAttributesFilled = useMemo(() => form.attributes.length > 0 && !inactiveDomain, [form.attributes.length, inactiveDomain]);

  const fetchRequiredAttributes = useCallback(async () => {
    const response = await fetchRequiredCategoryAttributes({ selectedCategory: domainId });
    setRequiredAttributes(response);
  }, [domainId]);

  useEffect(() => {
    if (isAttributesFilled) {
      fetchRequiredAttributes();
    }
  }, [fetchRequiredAttributes, isAttributesFilled]);
  // End charts required attributes

  // Start fetch catalog charts
  const [lastAttributesSaved, setLastAttributesSaved] = useState(null);
  const selectedAccounts = useSelector(state =>
    state.accounts.selectedAccounts.map(({ value }) => state.accounts.accounts[value]),
  );

  const filledRequiredAttributes = useMemo(() => {
    const filled = form.attributes.reduce((filledAttributes, attribute) => {
      const isRequiredAttribute = requiredAttributes.filter(({ id }) => id === attribute.id)?.length;

      if (isRequiredAttribute && (attribute.value_name || attribute.value_id)) {
        const { id, name, value_id, value_name, values } = attribute;
        const result = { id };
        name && (result.name = name);
        value_id && (result.value_id = value_id);
        value_name && (result.value_name = value_name);
        if (values?.length) {
          result.values = values.filter(value => value.name === value_name);
        } else {
          const foundInVisibleAttributeList = visibleAttributeList.filter(attribute => attribute.id === id);
          if (foundInVisibleAttributeList?.length) {
            const { values } = foundInVisibleAttributeList[0];
            values && (result.values = values.filter(value => value.name === value_name));
          }
        }
        return [...filledAttributes, result];
      }
      return filledAttributes;
    }, []);

    if (filled.filter(attribute => attribute.value_name).length === requiredAttributes.length) return filled;
    return null;
  }, [form.attributes, requiredAttributes, visibleAttributeList]);

  const payload = useMemo(
    () => ({
      account_id: selectedAccounts ? selectedAccounts[0]?.id : null,
      domain_id: domainId?.match("MLB") ? domainId.split("MLB-")[1] : domainId,
      attributes: filledRequiredAttributes,
    }),
    [domainId, filledRequiredAttributes, selectedAccounts],
  );

  const setCatalogCharts = useCallback(value => setFormData({ id: "catalogCharts", value }), [setFormData]);

  const fetchCharts = useCallback(async () => {
    const response = await fetchCatalogCharts({ payload });
    if (response === "domain_not_active") {
      setInactiveDomain(true);
    } else {
      setCatalogCharts(response);
    }
  }, [payload, setCatalogCharts]);

  const shouldFetchCharts = useMemo(
    () =>
      requiredAttributes.length &&
      JSON.stringify(requiredAttributes) !== lastAttributesSaved &&
      payload.attributes?.length,
    [lastAttributesSaved, payload.attributes?.length, requiredAttributes],
  );

  useEffect(() => {
    if (shouldFetchCharts) {
      setLastAttributesSaved(JSON.stringify(requiredAttributes));
      fetchCharts();
    }
  }, [fetchCharts, requiredAttributes, shouldFetchCharts]);
  // End fetch catalog charts

  return isAttributesFilled ? (
    <CCard className="border-primary">
      <CCardHeader>
        <h4>Medidas</h4>
      </CCardHeader>
      <CCardBody>
        <CatalogChartsAlert />
        <CatalogChartSelect showAttributesAlert={payload.attributes?.length} />
        <CatalogChartsSelectRow />
      </CCardBody>
    </CCard>
  ) : (
    <></>
  );
};

export default CatalogCharts;
