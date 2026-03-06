import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Col, Container, Row } from 'reactstrap';

class Page404 extends Component {
  render() {
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="6">
              <div className="clearfix">
                <h1 className="float-left display-3 mr-4">404</h1>
                <h4 className="pt-3">Oops! Caminho errado.</h4>
                <p className="text-muted float-left">A página que você está tentando acessar não foi encontrada.</p>
                <Link to="/dashboard">
                  <Button type="submit" color="primary">Voltar</Button>
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Page404;
