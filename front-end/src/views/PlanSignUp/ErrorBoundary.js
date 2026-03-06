import React, { Component } from "react";
import Swal from "sweetalert2";

class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    Swal.fire({
      title: "Ops!",
      html: `<p>${error.response ? error.response.data.message : error}</p>`,
      type: "warning",
      showCloseButton: true,
    }).then(this.props.history.push("/home"));
  }
  render() {
    if (this.state.hasError) {
      return <h1>OOPS</h1>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
