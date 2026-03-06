import PropTypes from "prop-types";
import React from "react";
import { ButtonDropdown, ButtonGroup, DropdownMenu, DropdownToggle } from "reactstrap";
import Swal from "sweetalert2";
import api from "../../services/api";

function DropDown({ style, direction, size, caret, color, btnGroupClassName, title, children }) {
  const [isOpened, setIsOpened] = React.useState(false);
  function toggle() {
    setIsOpened(previous => !previous);
  }

  return (
    <ButtonGroup style={style}>
      <ButtonDropdown direction={direction} isOpen={isOpened} toggle={toggle} size={size || ""}>
        <DropdownToggle caret={caret} color={color || "primary"} className={btnGroupClassName}>
          {title || <span>Opções</span>}
        </DropdownToggle>
        <DropdownMenu>{children}</DropdownMenu>
      </ButtonDropdown>
    </ButtonGroup>
  );
}

DropDown.propTypes = {
  style: PropTypes.object,
  direction: PropTypes.string,
  size: PropTypes.string,
  caret: PropTypes.bool,
  color: PropTypes.string,
  btnGroupClassName: PropTypes.string,
  title: PropTypes.any,
  children: PropTypes.array,
};

class BtnGroup extends React.Component {
  render() {
    return (
      <>
        <ButtonGroup className="this.props.className">{this.props.children}</ButtonGroup>
      </>
    );
  }
}

class Item extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      http: null,
      url: null,
      called: 0,
      ask: null,
      mode: "sleep",
    };
    this.handleBuild = this.handleBuild.bind(this);
    this.callApi = this.callApi.bind(this);
  }
  componentDidMount() {
    this.handleBuild();
  }

  handleBuild = async () => {
    if (this.state.mode === "sleep") {
      try {
        const { data, http, url, ask } = this.props;
        if (ask !== undefined) this.setState({ ask });
        if (data !== undefined) this.setState({ data });
        if (http !== undefined) this.setState({ http });
        if (url !== undefined) this.setState({ url });

        if (http !== null && url !== null) {
          this.setState({ mode: "ready" });
        }
      } catch (error) {
        Swal.fire({
          html: `<p>${error}</p>`,
          type: "error",
          showCloseButton: true,
        });
      }
    }
  };

  notify = res => {
    Swal.fire({
      html: `<p>${res.data.message}</p>`,
      type: res.data.status,
      showCloseButton: true,
    });
  };

  callApi = async () => {
    try {
      await this.handleBuild();
      const { data, http, url } = this.state;
      if (http === "get") {
        const statusResponse = await api.get(url);
        this.notify(statusResponse);
      } else if (http === "patch") {
        const statusResponse = await api.patch(url);
        this.notify(statusResponse);
      } else if (http === "put") {
        if (data === null) {
          Swal.fire({
            html: `<p>${this.state.ask}</p>`,
            type: "question",
            input: "text",
            showConfirmButton: true,
            showCancelButton: true,
            cancelButtonText: "Cancelar",
          }).then(res => {
            if (res !== null && res !== undefined) {
              api.put(url, { name: res.value }).then(resT => {
                Swal.fire({
                  html: `<p>${resT.data.message}</p>`,
                  type: resT.data.status,
                  showCloseButton: true,
                });
              });
            }
          });
        } else {
          const statusResponse = await api.put(url, data);
          this.notify(statusResponse);
        }
      } else if (http === "post") {
        const statusResponse = await api.post(url, data);
        this.notify(statusResponse);
      } else if (http === "delete") {
        const statusResponse = await api.delete(url);
        this.notify(statusResponse);
      }
      await this.setState("sleep");
    } catch {}
  };

  askForIt = () => {
    if (this.state.ask !== null && this.state.ask !== undefined) {
      Swal.fire({
        html: `<p>${this.state.ask}</p>`,
        type: "question",
        input: "text",
        showConfirmButton: true,
        showCancelButton: true,
        cancelButtonText: "Cancelar",
      }).then(ress => {
        return ress.value;
      });
    }
  };

  render() {
    return (
      <button
        className={this.props.className}
        onClick={() => this.callApi()}
        name={this.props.name}
        data={this.props.data}
        http={this.props.http}
        url={this.props.url}
        ask={this.props.ask}
      >
        {this.props.children}
      </button>
    );
  }
}

export { BtnGroup, DropDown, Item };
