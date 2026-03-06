import dictionary from "./dictionary";

const Icon = ({ promotionsType }) => dictionary[promotionsType]?.icon;

export default Icon;
