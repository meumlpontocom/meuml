import React, { forwardRef, useMemo, useState } from "react";
import { FaChevronDown, FaChevronRight, FaChevronUp } from "react-icons/fa";
import { SELECT_ML_CATEGORY_HEIGHT } from "src/constants";
import "./style.css";
import { useSelector } from "react-redux";

/**
 * CustomSelect component to create a custom dropdown select input.
 *
 * @param {Object} props - The properties object.
 * @param {React.ReactNode} props.children - The children elements to be displayed inside the dropdown.
 * @param {string} [props.placeholder="Select..."] - The placeholder text to be displayed when no value is selected.
 * @param {string} [props.height="36px"] - The minimum height of the select input.
 * @param {string} [props.value] - The selected value to be displayed.
 * @param {Function} [props.onClose] - The callback function to be called when the dropdown is closed.
 * @param {boolean} [props.disabled=false] - Flag to disable the select input.
 * @param {React.Ref} ref - The reference object to be attached to the container div.
 *
 * @returns {JSX.Element} The CustomSelect component.
 *
 * @component
 * @example
 * // Basic usage of CustomSelect with Accounts subcomponent
 * <CustomSelect placeholder="Select Account" value={selectedAccount?.name}>
 *   <CustomSelect.Accounts platform="ML" onSelect={handleSelect} onClose={handleClose} />
 * </CustomSelect>
 *
 * @example
 * // Basic usage of CustomSelect with Charts subcomponent
 * <CustomSelect placeholder="Select Chart" value={selectedChart?.name}>
 *   <CustomSelect.Charts charts={chartsData} onSelect={handleSelect} onClose={handleClose} />
 * </CustomSelect>
 *
 * @example
 * // Basic usage of CustomSelect with Item
 * <CustomSelect.Item key={item.id} item={item} onClose={onClose} onSelect={onSelect} />
 *
 * @subcomponent Accounts
 * @description A subcomponent of CustomSelect that renders a list of accounts filtered by platform.
 * @param {string} platform - The platform filter for accounts (e.g., "ML").
 * @param {Function} onSelect - The function to handle account selection.
 * @param {Function} onClose - The function to handle closing the dropdown.
 *
 * @subcomponent Charts
 * @description A subcomponent of CustomSelect that renders a list of charts options.
 * @param {Array} charts - The array of chart objects to display.
 * @param {Function} onSelect - The function to handle chart selection.
 * @param {Function} onClose - The function to handle closing the dropdown.
 *
 * @subcomponent Item
 * @description A subcomponent of CustomSelect that renders each selectable item.
 * @param {Object} item - The item object containing data to be displayed in the dropdown.
 * @param {Function} onSelect - The function to handle item selection.
 * @param {Function} onClose - The function to handle closing the dropdown after selection.
 */
const CustomSelect = forwardRef(
  ({ children, placeholder = "Select...", height = "36px", value, onClose, disabled = false }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    };

    const handleClose = () => {
      setIsOpen(false);
      if (onClose) {
        onClose();
      }
    };

    return (
      <div id="container-select" ref={ref}>
        <div
          id="select-input"
          onClick={toggleOpen}
          style={{
            minHeight: height,
            color: disabled ? "#ccc" : "#777",
            background: disabled ? "#f5f5f5" : "#fff",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          {value ? <div style={{ color: "#444" }}>{value}</div> : placeholder}
          {isOpen ? (
            <FaChevronUp color={disabled ? "#ccc" : "#888"} />
          ) : (
            <FaChevronDown color={disabled ? "#ccc" : "#888"} />
          )}
        </div>
        {isOpen && !disabled && (
          <div
            id="opned-select"
            style={{
              maxHeight: `${SELECT_ML_CATEGORY_HEIGHT}px`,
            }}
          >
            {React.cloneElement(children, { onClose: handleClose })}
          </div>
        )}
      </div>
    );
  },
);

CustomSelect.Accounts = function Accounts({ platform, onSelect, onClose }) {
  const { accounts } = useSelector(state => state.accounts);

  const accountList = useMemo(() => {
    return Object.values(accounts).filter(
      account => account.internal_status === 1 && account.platform === platform,
    );
  }, [accounts, platform]);

  return (
    <div id="container">
      {accountList.map(item => (
        <CustomSelect.Item key={item.id} item={item} onClose={onClose} onSelect={onSelect} />
      ))}
    </div>
  );
};

CustomSelect.Charts = function Charts({ charts, onSelect, onClose }) {
  const chartsOptions = useMemo(
    () => charts.map(item => ({ id: item.id, name: item.names[item.site_id ?? "MLB"] })),
    [charts],
  );

  return (
    <div id="container">
      {chartsOptions.map(item => (
        <CustomSelect.Item key={item.id} item={item} onClose={onClose} onSelect={onSelect} />
      ))}
    </div>
  );
};

CustomSelect.Item = function Item({ key, item, onClose, onSelect }) {
  return (
    <button
      id="option-select"
      key={key}
      onClick={() => {
        onSelect(item);
        if (onClose) onClose();
      }}
    >
      {item.name}
      <FaChevronRight className="mr-4" color="#aaa" size={14} />
    </button>
  );
};

export default CustomSelect;
