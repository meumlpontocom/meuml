import React, { useState } from 'react';
import { connect } from "react-redux";
import { setDisplayConfig } from "../../../redux/actions";
import {
  Col,
  Row,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  DropdownMenu
} from "reactstrap";

const DisplayConfigDropDown = ({ components, dispatch }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen(prevState => !prevState);

  const handleSelected = id => {
    components.map((component, index) => {
      switch (component.code) {
        case id:
          handleComponentStatus(component, index);
          break;
        default:
          break;
      }
    });
  };

  const handleComponentStatus = (component, index) => {
    component.status ? (component.status = false) : (component.status = true);
    dispatch(setDisplayConfig({ component, index }));
  };
  return (
    <Row>
      <Col sm="12" md="12" lg="12" xs="12">
        <Dropdown direction="right" className="mb-4" isOpen={dropdownOpen} toggle={toggle}>
          <DropdownToggle color="primary" caret>Customizar</DropdownToggle>
          <DropdownMenu>
            <DropdownItem header>
              Adicionar ou Remover Iformações
            </DropdownItem>
            {components.map(module => (
              <DropdownItem
                active={module.status}
                id={module.code}
                onClick={event => handleSelected(event.target.id)}
              > {module.name}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </Col>
    </Row>
  );
}

export default connect(state => ({ components: state.components }))(DisplayConfigDropDown);