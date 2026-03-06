import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardBody, CardFooter, Col, Container, Fade } from 'reactstrap';

export default class Carton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fadeIn: true,
      timeout: 300
    }
  }

  componentWillMount() {
    this.setState({
      fadeIn: this.props.fadeIn,
      timeout: this.props.timeout
    });
  }

  render() {
    return (
      <Container>
        <Col xs={this.props.xs} sm={this.props.sm} md={this.props.md} key={this.props.key}>
          <Fade timeout={this.state.timeout} in={this.state.fadeIn}>
            <Card className={this.props.cardClass}>
              <CardHeader className={this.props.headerClass}>
                {this.props.header}
              </CardHeader>
              <CardBody className={this.props.bodyClass}>
                {this.props.children}
              </CardBody>
              <CardFooter className={this.props.footerClass}>
                {this.props.footer}
              </CardFooter>
            </Card>
          </Fade>
        </Col>
      </Container>
    );
  }
}

Carton.propTypes = {
  fadeIn: PropTypes.bool,
  timeout: PropTypes.number,
  cardClass: PropTypes.string,
  headerClass: PropTypes.string,
  bodyClass: PropTypes.string,
  footerClass: PropTypes.string,
  header: PropTypes.any,
  children: PropTypes.any,
  footer: PropTypes.any
}