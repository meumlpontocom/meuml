import { useContext } from "react";
import context from "../../advertReplicationContext";
import { Input, InputGroup, InputGroupAddon, InputGroupText, Label } from "reactstrap";

const KeywordInput = () => {
  const { keyword, setKeyword, isLoading, submitSearch } = useContext(context);

  return (
    <>
      <Label htmlFor="keyword-input">Palavra-chave</Label>
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <i className="cil-text" title="Busca por palavra-chave" />
          </InputGroupText>
        </InputGroupAddon>
        <Input
          onKeyPress={({ key }) => key.toString() === "Enter" && submitSearch({ page: 1 })}
          disabled={isLoading}
          name="keyword-input"
          id="keyword-input"
          type="text"
          placeholder="Pesquisar palavra-chave"
          title="Pesquisar palavra-chave"
          value={keyword}
          onChange={({ target: { value } }) => setKeyword(value)}
          style={{ height: "42px" }}
        />
      </InputGroup>
    </>
  );
};

export default KeywordInput;
