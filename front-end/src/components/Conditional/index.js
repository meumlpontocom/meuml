const Conditional = ({ render, children }) => {
  return render ? children : <></>;
};

export default Conditional;
