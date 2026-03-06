import React, { Component } from  'react';

export class ActionLabel extends Component {
  render() {
    return(
      <>
        <div key={this.props.key} className="list-group-item list-group-item-action flex-column align-items-start">
          <div className="d-flex w-100 justify-content-between">
            {this.props.children}
          </div>
        </div>
      </>
    );
  }
}

export class ActionGroup extends Component {
  render() {
    return(
      <>
        <div className={`list-group ${this.props.className}`}>
          {this.props.children}
        </div>
      </>
    );
  }
}
