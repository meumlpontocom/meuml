import React, { useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  CCard,
  CCardBody,
  CButton,
  CCollapse,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CInput,
  CDropdownItem
} from "@coreui/react";
import "./styles.css";

export default function SelectShopeeCategoriesTree({
  callback,
  selected,
  placeholder,
  includeFilter = true,
  valid,
  invalid,
}) {
  const categoriesTree = useSelector(state => state.shopee.categoriesTree.data);
  const [expandedNodes, setExpandedNodes] = useState([]);
  const [filterText, setFilterText] = useState("");

  const selectedCategory = useMemo(
    () => categoriesTree.filter(category => category?.category_id === selected),
    [categoriesTree, selected],
  );

  const borderColor = useMemo(() => {
    let color = "#e0e0e0";
    if (valid) color = "#2EB85C";
    if (invalid) color = "#E55353";
    return color;
  }, [valid, invalid]);

  const transformCategories = categories => {
    const map = new Map();
    const roots = [];

    categories.forEach(category => {
      const { category_id, display_category_name, parent_category_id, has_children } = category;
      const node = {
        id: category_id.toString(),
        label: display_category_name,
        children: [],
        hasChildren: has_children,
      };

      map.set(category_id, node);

      if (parent_category_id === 0) {
        roots.push(node);
      } else {
        const parent = map.get(parent_category_id);
        if (parent) {
          parent.children.push(node);
        }
      }
    });

    return roots;
  };

  const treeData = useMemo(() => transformCategories(categoriesTree), [categoriesTree]);

  const handleExpandClick = id => {
    setExpandedNodes(prevExpandedNodes =>
      prevExpandedNodes.includes(id)
        ? prevExpandedNodes.filter(nodeId => nodeId !== id)
        : [...prevExpandedNodes, id],
    );
  };

  const handleFilterChange = e => {
    setFilterText(e.target.value);
  };

  const handleSelect = node => {
    if (callback) {
      callback(node);
    }
  };

  const filterNodes = useCallback((nodes, filterText) => {
    return nodes.reduce((acc, node) => {
      const shouldIncludeNode =
        node.label.toLowerCase().includes(filterText.toLowerCase()) ||
        (node.children && filterNodes(node.children, filterText).length > 0);

      if (shouldIncludeNode) {
        acc.push({
          ...node,
          children: filterNodes(node.children, filterText),
        });
      }
      return acc;
    }, []);
  }, []);

  const filteredData = useMemo(() => filterNodes(treeData, filterText), [filterNodes, treeData, filterText]);

  const renderTreeNodes = (nodes, level = 0) => {
    return nodes.map(node => (
      <div key={node.id} style={{ marginLeft: `${level * 20}px`, whiteSpace: "nowrap" }}>
        {node.hasChildren ? (
          <>
            <CButton
              className="select-category-button"
              onClick={() => handleExpandClick(node.id)}
              style={{ gap: "16px", display: "flex", boxShadow: 'none' }}
            >
              <span
                style={{
                  color: "#a0a0a0",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {expandedNodes.includes(node.id) ? "▼" : "►"}
              </span>
              <span>{node.label}</span>
            </CButton>
          </>
        ) : (
          <CDropdownItem className="select-category-button" onClick={() => handleSelect(node)}>
            {node.label}
          </CDropdownItem>
        )}
        <CCollapse show={expandedNodes.includes(node.id)}>
          {node.children.length > 0 && renderTreeNodes(node.children, level + 1)}
        </CCollapse>
      </div>
    ));
  };

  return (
    <CDropdown
      id="dropdown-categories"
      className="drop-down-base"
      style={{ border: `1px solid ${borderColor}` }}
    >
      <CDropdownToggle
        style={{
          boxShadow: "none",
          width: "100%",
          height: "30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 10px",
        }}
      >
        <span style={{ flex: 1, textAlign: "left" }}>
          {selectedCategory[0]?.display_category_name ?? placeholder}
        </span>
      </CDropdownToggle>
      <CDropdownMenu
        style={{
          width: "auto",
          minWidth: "fit-content",
          maxHeight: "400px",
          overflowY: "auto",
          overflowX: "hidden",
          padding: 0,
          margin: 0,
        }}
      >
        {includeFilter && (
          <div style={{ padding: "10px" }}>
            <CInput
              type="text"
              placeholder="Filtrar por..."
              value={filterText}
              onChange={handleFilterChange}
            />
          </div>
        )}
        <CCard
          style={{
            whiteSpace: "nowrap",
            margin: 0,
            padding: 0,
            border: "none",
            outline: "none",
            boxShadow: "none",
          }}
        >
          <CCardBody style={{ paddingRight: 0, paddingTop: 0, paddingBottom: 0, paddingLeft: 10 }}>
            {renderTreeNodes(filteredData)}
          </CCardBody>
        </CCard>
      </CDropdownMenu>
    </CDropdown>
  );
}
