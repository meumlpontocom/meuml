import React, { useContext, useMemo } from "react";
import { createMlAdvertContext } from "src/views/Anuncios/Create/createMlAdvertContext";

const CategoryTree = () => {
  const { form } = useContext(createMlAdvertContext);
  const attributes = useMemo(() => form.selectedCategory.attributes, [form.selectedCategory.attributes]);

  return attributes ? (
    attributes.map((attribute, index) => (
      <span key={attribute.id} className="text-muted">
        {attribute.name}:&nbsp;{attribute.value_name}
        {index + 1 < attributes.length ? " / " : ""}
      </span>
    ))
  ) : (
    <p className="text-muted">Selecione a categoria do seu produto:</p>
  );
};

export default CategoryTree;
