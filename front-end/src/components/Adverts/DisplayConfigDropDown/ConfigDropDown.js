import React, { Component }   from "react";
import { Col }                from "reactstrap";
import { Picky }              from "react-picky";
import { connect }            from "react-redux";
import { setDisplayConfig }   from "../../../redux/actions";

class ConfigDropDown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      components: [],
      active: []
    };
  }
  componentDidMount() {
    this.handleState();
  }

  handleState() {
    const componentsNames = this.props.components.components.map(component => {
      return component.name;
    });

    this.setState({
      components: componentsNames,
      active: componentsNames
    });
  }

  multiSelector(active) {
    this.setState({ active });
    this.props.dispatch(setDisplayConfig({ payload: active }));
  }

  render() {
    const { xs, sm, md, lg } = this.props;
    return (
      <Col xs={xs} sm={sm} md={md} lg={lg}>
        <Picky
          open={false}
          multiple={true}
          valueKey="value"
          labelKey="label"
          includeFilter={true}
          dropdownHeight={600}
          includeSelectAll={true}
          value={this.state.active}
          placeholder="Selecione..."
          className="multiSelBlockUser"
          onChange={selected => this.multiSelector(selected)}
          options={this.state.components}
          selectAllText="Selecionar Todos"
          filterPlaceholder="Filtrar por..."
          allSelectedPlaceholder="%s Selecionados"
          manySelectedPlaceholder="%s Selecionados"
        />
      </Col>
    );
  }
}

export default connect(state => ({ components: state.components }))(ConfigDropDown);
