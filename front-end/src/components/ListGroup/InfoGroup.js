import React, { Component } from 'react';

export class InfoGroup extends Component {
  render() {
    return(
      <ul className={`list-group ${this.props.className}`}>
        {this.props.children}
      </ul>
    );
  }
}

export class InfoLabel extends Component {
  render() {
    return(
      <li className="list-group-item d-flex justify-content-between align-items-center">
        {this.props.children}
        <span className="badge badge-primary badge-pill">{this.props.span}</span>
      </li>
    );
  }
}
