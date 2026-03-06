import {
  CModal,
  CModalHeader,
  CModalBody,
  CModalTitle,
  CModalFooter,
} from "@coreui/react";

/**
 * Renders a CoreUI's CModal wrapper with commom properties predefined for the Payment view.
 *
 * @param {object} props - The properties for the custom modal.
 * @param {boolean} props.show - Determines whether the modal is shown or hidden.
 * @param {function} props.setShow - Callback function to update the show state.
 * @param {string} props.title - The title of the modal.
 * @param {JSX.Element} props.body - The content of the modal body.
 * @param {JSX.Element} props.footer - The content of the modal footer.
 * @param {string} props.color - The color scheme of the modal.
 * @param {string} props.borderColor - The border color of the modal.
 * @param {boolean} props.closeButton - Determines whether to show the close button.
 * @param {boolean} props.closeOnBackdrop - Determines whether to close the modal when clicking on the backdrop.
 * @return {JSX.Element} The rendered custom modal component.
 */
function CustomModal({
  show = false,
  setShow = () => {},
  title = "",
  body = <></>,
  footer = null,
  color = "light",
  borderColor,
  closeButton = true,
  closeOnBackdrop = true,
}) {
  return (
    <CModal
      centered
      scrollable
      color={color}
      alignment="center"
      borderColor={borderColor}
      show={show}
      onClosed={() => setShow(false)}
      closeOnBackdrop={closeOnBackdrop}
    >
      <CModalHeader closeButton={closeButton}>
        <CModalTitle>{title}</CModalTitle>
      </CModalHeader>
      <CModalBody>{body}</CModalBody>
      {footer === null ? <></> : <CModalFooter>{footer}</CModalFooter>}
    </CModal>
  );
}

export default CustomModal;
