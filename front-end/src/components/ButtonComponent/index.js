import { CButton } from "@coreui/react";
import { Spinner } from "reactstrap";

const ButtonComponent = ({
  title,
  onClick,
  icon,
  color = "primary",
  id,
  name,
  variant = "outline",
  disabled = false,
  className,
  height = "34px",
  width,
  type,
  bgColor,
  textColor,
  isLoading = false,
}) => {
  return (
    <CButton
      type={type}
      variant={variant}
      id={id}
      name={name}
      color={color}
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: width < 120 ? width : "120px",
        justifyContent: "center",
        display: "flex",
        alignItems: "center",
        textAlign: "center",
        textWrap: "nowrap",
        height: height,
        width: width,
        gap: "16px",
        color: textColor,
        backgroundColor: bgColor,
      }}
      className={className}
    >
      {isLoading ? (
        <Spinner style={{ width: "16px", height: "16px" }} />
      ) : (
        <>{icon && (typeof icon === "string" ? <i className={icon} /> : icon)}</>
      )}
      {title && <span>{title}</span>}
    </CButton>
  );
};

export default ButtonComponent;
