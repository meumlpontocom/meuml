import React        from "react";
import { CPopover } from "@coreui/react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  logError({ error, info }) {
    const styles = fontSize => ([
      'padding: 10px',
      'color: #731111',
      'background: #ededed',
      `font-size: ${fontSize}`,
    ].join(";"));

    console.log("%cErro!", styles("20px"));
    console.log(`%c
      Por favor, se o erro persistir, contate o suporte:
      suporte@meuml.com+55 (41)99123-0100
	    
      Envie um print do conteúdo abaixo:
	    error_obj: ${JSON.stringify(error)}
	    Info: ${info}`, 
	    styles("16px")
    );
  }

  componentDidCatch(error, errorInfo) {
    this.logError({ error, info: errorInfo });
    this.setState({ hasError: true, error });
  }

  render() {
    if (this.state.hasError) {
      return this.props.render || (
        <h1 className="text-danger pointer">
          <CPopover content="Houve um erro na hora de processar esta informação. Contate o suporte para obter ajuda." placement="right">
            <i className="fas fa-times-circle" />
          </CPopover>
        </h1>
      );
    }

    return this.props.children;
  }
}