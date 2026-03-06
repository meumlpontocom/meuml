import React, { useContext, useMemo } from "react";
import PropTypes from "prop-types";
import { CListGroup } from "@coreui/react";
import ListItem from "src/views/Anuncios/Create/atoms/ListItem";
import { createMlAdvertContext } from "src/views/Anuncios/Create/createMlAdvertContext";

const Domains = ({ predictedCategory }) => {
  const { form, setFormData } = useContext(createMlAdvertContext);

  const selectedCategory = useMemo(
    () => form.selectedCategory.category_id,
    [form.selectedCategory.category_id],
  );
  const categoryByDomainName = useMemo(() => {
    return predictedCategory.reduce((dictionary, current) => {
      if (dictionary[current.domain_name]) {
        return {
          ...dictionary,
          [current.domain_name]: [...dictionary[current.domain_name], current],
        };
      }
      return { ...dictionary, [current.domain_name]: [current] };
    }, {});
  }, [predictedCategory]);

  const handleCategoryClick = category => {
    setFormData({
      id: "selectedCategory",
      value: selectedCategory === category.category_id ? { category_id: null } : category,
    });
  };

  return Object.keys(categoryByDomainName).map(domain => (
    <React.Fragment key={domain}>
      <h4 className="text-info">{domain}</h4>
      <CListGroup className="border-secondary list-group-accent">
        {categoryByDomainName[domain].map(item => (
          <ListItem
            id="selectedCategory"
            name="advert-category-select"
            key={item.category_id}
            onClick={() => handleCategoryClick(item)}
            isSelected={selectedCategory === item.category_id}
          >
            <p className="card-text text-muted">{item.category_name}</p>
          </ListItem>
        ))}
      </CListGroup>
    </React.Fragment>
  ));
};

Domains.propTypes = {
  predictedCategory: PropTypes.array.isRequired,
};

export default Domains;
