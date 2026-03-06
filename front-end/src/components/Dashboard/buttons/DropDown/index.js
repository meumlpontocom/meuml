import React from "react";
import { ButtonGroup, ButtonDropdown, DropdownMenu, DropdownToggle } from "reactstrap";

export default class DropDown extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dropdown: "closed" };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    if (this.state.dropdown === "closed") this.setState({ dropdown: "opened" });
    if (this.state.dropdown === "opened") this.setState({ dropdown: "closed" });
  }

  render() {
    return (
      <ButtonGroup>
        <ButtonDropdown
          isOpen={this.state.dropdown === "opened"}
          toggle={this.toggle}
        >
          <DropdownToggle caret color={this.props.color || 'primary'} size="sm">
            {this.props.title || <span>Opções</span>}
          </DropdownToggle>
          <DropdownMenu>{this.props.children}</DropdownMenu>
        </ButtonDropdown>
      </ButtonGroup>
    );
  }
}
