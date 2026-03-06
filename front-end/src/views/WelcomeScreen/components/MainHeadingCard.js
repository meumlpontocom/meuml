import MainHeadingStyles from "./MainHeadingStyles";

export const MainHeadingCard = ({ dashboardSummary }) => {
  return (
    <MainHeadingStyles>
      <h3>
        Bem vindo,{" "}
        <small className="text-muted">{dashboardSummary ? dashboardSummary.user.name : null}</small>
      </h3>
      <h6>{dashboardSummary ? dashboardSummary.user.email : null}</h6>
    </MainHeadingStyles>
  );
};
