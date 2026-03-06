import React        from 'react'
import PropTypes    from 'prop-types'
import { CTooltip } from '@coreui/react';

const BoostStatusIcon = ({ status, tooltip }) => {
  const IconWithTooltip = ({ icon }) => (
    <CTooltip content={tooltip}>
      <td className="text-center strong">
        {icon}
      </td>
    </CTooltip>
  );

  switch (status) {
    case "boosted":
      return <IconWithTooltip icon={<i className="cil-check text-success" />} />;

    case "not_boosted":
      return <IconWithTooltip icon={<span className="text-danger">X</span>} />;

    case "opportunity":
      return <IconWithTooltip icon={<i className="cil-pen text-primary" />} />;

    default:
      return <IconWithTooltip icon={<span>-</span>} />;
  }
}

BoostStatusIcon.propTypes = {
  status: PropTypes.string.isRequired,
  tooltip: PropTypes.string.isRequired,
}

export default BoostStatusIcon;
