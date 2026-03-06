import PropTypes          from "prop-types";
import { CListGroupItem } from "@coreui/react";
import styled             from "styled-components";

const ListItem = styled(CListGroupItem)`
  cursor: pointer;
  border-radius: 0;
  border-left: 4px solid ${props => props.isSelected ? "#321fdb" : "#636f83"};
`;

ListItem.propTypes = {
  isSelected: PropTypes.bool.isRequired,
}

export default ListItem;
