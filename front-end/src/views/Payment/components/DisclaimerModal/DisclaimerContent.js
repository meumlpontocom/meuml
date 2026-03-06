function DisclaimerContent({ step, content }) {
  return (
    <div
      style={{
        textAlign: "justify",
        marginBottom: step === 0 ? "50px" : 0,
      }}
    >
      <p className={`lead ${step === 0 && "mt-5"} ${step === 2 && "mt-3"}`}>
        {content[step][1]}
      </p>
    </div>
  );
}

export default DisclaimerContent;
