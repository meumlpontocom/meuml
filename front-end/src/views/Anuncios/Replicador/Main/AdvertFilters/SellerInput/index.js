import { useContext } from "react";
import context from "../../advertReplicationContext";
import { Input, InputGroup, InputGroupAddon, InputGroupText, Label } from "reactstrap";

const SellerInput = () => {
  const { nickname, setNickname, isLoading, submitSearch } = useContext(context);

  return (
    <>
      <Label htmlFor="seller-input">Apelido</Label>
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <i className="cil-user" title="Busca por palavra-chave" />
          </InputGroupText>
        </InputGroupAddon>
        <Input
          onKeyPress={({ key }) => key.toString() === "Enter" && submitSearch({ page: 1 })}
          disabled={isLoading}
          name="seller-input"
          id="seller-input"
          type="text"
          placeholder="Pesquisar apelido de vendedor"
          title="Pesquisar apelido de vendedor"
          value={nickname}
          onChange={({ target: { value } }) => setNickname(value)}
          style={{ height: "42px" }}
        />
      </InputGroup>
    </>
  );
};

export default SellerInput;
