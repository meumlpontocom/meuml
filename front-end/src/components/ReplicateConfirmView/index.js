import PageHeader from "../PageHeader";
import ConfirmationBody from "./ConfirmationBody";
import ConfirmationFooter from "./ConfirmationFooter";
import ConfirmationHeader from "./ConfirmationHeader";

const ReplicateConfirmView = () => {
  return (
    <>
      <PageHeader heading="Replicar Anúncios" subheading="Mercado Livre" />
      <ConfirmationHeader />
      <ConfirmationBody />
      <ConfirmationFooter />
    </>
  );
};

export default ReplicateConfirmView;
