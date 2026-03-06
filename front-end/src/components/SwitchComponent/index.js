import { CFormGroup, CSwitch } from "@coreui/react";

const SwitchComponent = ({
  leftText = { text: "Não copiar", color: "text-danger" },
  rightText = { text: "Copiar", color: "text-success" },
  id,
  name,
  checked,
  value,
  onChange,
}) => {
  return (
    <CFormGroup className="box-toggle d-flex align-items-center">
      <span className={leftText.color}>{leftText.text}</span>
      <CSwitch
        className={"mx-2"}
        color="primary"
        variant="opposite"
        size="sm"
        id={id}
        name={name}
        checked={checked}
        value={value}
        onChange={onChange}
      />
      <span className={rightText.color}>{rightText.text}</span>
    </CFormGroup>
  );
};

export default SwitchComponent;
