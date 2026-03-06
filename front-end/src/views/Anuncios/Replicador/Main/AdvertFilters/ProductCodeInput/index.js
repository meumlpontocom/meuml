import { TfiPackage } from "react-icons/tfi";
import { Input, InputGroup, InputGroupAddon, InputGroupText, Label } from "reactstrap";

const ProductCodeInput = ({ inputRef }) => {
  return (
    <>
      <Label htmlFor="seller-input">Código do anúncio</Label>
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <TfiPackage size={22} />
          </InputGroupText>
        </InputGroupAddon>
        <Input
          name="seller-input"
          id="seller-input"
          type="text"
          placeholder="Pesquisar código do anúncio"
          title="Pesquisar código do anúncio"
          onChange={e => (inputRef.current = e.target.value)}
          disabled
        />
      </InputGroup>
    </>
  );
};

export default ProductCodeInput;
