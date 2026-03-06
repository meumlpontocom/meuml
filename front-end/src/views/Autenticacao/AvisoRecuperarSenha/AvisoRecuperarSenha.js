import React, { Component }                            from 'react';
import { Link }                                        from 'react-router-dom';
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
import logo                                            from '../../../assets/img/brand/MeuML-logo2.png'


class AvisoRecuperarSenha extends Component {
  constructor(props) {
    super(props);

    this.setState({email : props.match?.params.value});
    // ...

  }

  render() {
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="6">
              <Card class="col-md-12 text-muted py-5 d-md-down-none">
                  <CardBody className="text-center">
                    <div className="animated fadeIn">
                      <h2><img src={logo} width="60%" class="espacoLogoCadastro" alt="MeuML" /></h2>
                      <h2 class="tituloLogin">Recuperar Senha</h2>
                      <div class="alert alert-warning fade show">
                      <p>Enviamos para o e-mail <b>{this.email}</b> com as instruções e informações de recuperação de senha.</p>
                      <p>No corpo do email consta um link de recuperação da sua senha.</p>
                      <p>Confira no lixo eletrônico em caso de não constar o recebimento</p>
                      </div>
                      <Row>
                        <Col xs="12" className="text-center">
                        <Link to="/">
                        <Button color="primary">Voltar ao Login</Button>
                        </Link>
                        </Col>
                      </Row>
                      </div>
                  </CardBody>
                </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default AvisoRecuperarSenha;
