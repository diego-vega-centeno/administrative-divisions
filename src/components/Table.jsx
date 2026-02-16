import styles from '../styles/OSMTagsDropDown.module.css'

export default function Table({ selectedIdMap }) {
  return (
    <div>
      <div className={styles["table-container"]}>
        <table className={styles["table"]}>
          <tbody>
            {Object.entries(selectedIdMap).map(([key, value]) => {
              if (key === 'populationTS') return null;
              let displayValue = value;

              if (['ethnicGroup', 'officialLang', 'officialName'].includes(key)) {
                if (!value.size) {
                  displayValue = '--'
                } else {
                  displayValue = [...value].join(' | ');
                };
              }
              if (!displayValue) displayValue = '---';

              return (
                <tr key={key} className={styles["row"]}>
                  <th className={styles["cell-key"]}>{key}</th>
                  <td className={styles["cell-value"]}>{displayValue}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}