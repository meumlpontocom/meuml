/**
 * Recursively validates if all required attributes in the tree are properly filled.
 * Returns true if the tree is valid, false otherwise.
 */
export function validateRequiredAttributes(attributes) {
  // Empty tree is valid (no required attributes)
  if (!attributes || attributes.length === 0) {
    return true;
  }

  for (const attr of attributes) {
    // Check if attribute has a valid value based on its type
    let hasValidValue = false;

    if (attr.type === "text") {
      // Text type: value must be a non-empty string
      hasValidValue = typeof attr.value === "string" && attr.value.trim().length > 0;
    } else if (attr.type === "single") {
      // Single type: value must not be null (an option is selected)
      hasValidValue = attr.value !== null && attr.value !== undefined;
    } else if (attr.type === "multiple") {
      // Multiple type: value array must have at least one item
      hasValidValue = Array.isArray(attr.value) && attr.value.length > 0;
    }

    // If attribute doesn't have a valid value, tree is invalid
    if (!hasValidValue) {
      return false;
    }

    // For selected values that have children, validate those children recursively
    if (attr.values_list && attr.values_list.length > 0) {
      for (const valueItem of attr.values_list) {
        // Only check children of selected values
        if (valueItem.selected && valueItem.children && valueItem.children.length > 0) {
          const childrenValid = validateRequiredAttributes(valueItem.children);
          if (!childrenValid) {
            return false;
          }
        }
      }
    }
  }

  // All attributes are valid
  return true;
}
