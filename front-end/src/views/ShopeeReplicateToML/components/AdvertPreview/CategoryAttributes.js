import React, { useContext, useMemo } from "react";
import shopeeReplicateToMLContext     from "../../shopeeReplicateToMLContext";

const CategoryAttributes = () => {
  const { form, requiredAttributes } = useContext(shopeeReplicateToMLContext);
  const ths = useMemo(() => {
    return Object.keys(form.required).map((attributeName, idx) => (
      {
        key: `${attributeName}${idx}`,
        label: requiredAttributes.find(({ id }) => id === attributeName)?.name || attributeName,
      }
    ));
  }, [form.required, requiredAttributes]);
  return (
    <>
      <h3 className="mt-3 text-info">Atributos da categoria</h3>
      {!Object.keys(form.required).length
        ? (
          <p className="text-muted">N/A</p>
        ) : (
          <table className="table table-responsive">
            <thead className="table-warning">
            <tr>
              {ths.map(({ key, label }) => (
                <th key={key}>{label}</th>
              ))}
            </tr>
            </thead>
            <tbody className="table-secondary">
            <tr>
              {Object.values(form.required).map((attribute, idx) => (
                <td key={`${attribute}${idx}`}>{attribute}</td>
              ))}
            </tr>
            </tbody>
          </table>
        )}
    </>
  );
};

export default CategoryAttributes;
