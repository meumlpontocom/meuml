import React            from "react"
import PropTypes        from "prop-types"
import { CCol }         from "@coreui/react";
import BoostStatusIcon  from "./BoostStatusIcon"

function ConditionsTable({ selfBoosts, winnerBoosts, setSelectedCondition }) {
  const tableDataMemo = React.useMemo(() => {
    let data = {}
    const dataProcessing = (boost, key) => data[boost.id] = { ...data[boost.id], [key]: boost }
    selfBoosts && selfBoosts.forEach(x => dataProcessing(x, "self"));
    winnerBoosts && winnerBoosts.forEach(x => dataProcessing(x, "winner"));
    return data;
  }, [selfBoosts, winnerBoosts]);

  return (
    <CCol xs={12}>
      <table id="boosts-status-data-table">
        <thead>
          <th id="translated-status-name"></th>
          <th id="winner-status-value">Melhor competidor</th>
          <th id="self-status-value">Esta publicação</th>
        </thead>
        <tbody>
          {Object.keys(tableDataMemo).map(
            boostID => (
              <tr key={boostID}>
                <td>{tableDataMemo[boostID].self.description}</td>
                <BoostStatusIcon
                  isWinner={true}
                  boostId={boostID}
                  setSelectedCondition={setSelectedCondition}
                  status={tableDataMemo[boostID].winner.status}
                  tooltip={tableDataMemo[boostID].winner.status_ptbr}
                />
                <BoostStatusIcon
                  boostId={boostID}
                  status={tableDataMemo[boostID].self.status}
                  tooltip={tableDataMemo[boostID].self.status_ptbr}
                  boostLabel={tableDataMemo[boostID].self.description}
                />
              </tr>
            )
          )}
        </tbody>
      </table>
    </CCol>
  )
}

ConditionsTable.propTypes = {
  selfBoosts: PropTypes.array.isRequired,
  winnerBoosts: PropTypes.array.isRequired,
  setEditingCondition: PropTypes.func.isRequired,
  setSelectedCondition: PropTypes.func.isRequired,
}

export default ConditionsTable

