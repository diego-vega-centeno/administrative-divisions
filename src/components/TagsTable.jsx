import { useMemo, useState } from 'react';
import styles from '../styles/OSMTagsDropDown.module.css'
import Collapse from '@mui/material/Collapse';

export default function TagsTable({ osmRel }) {
  if (!osmRel) return null;

  // SubTable compoenent needs to be in top level due to useState
  function SubTable({ label, rows }) {
    const [open, setOpen] = useState(false);

    return (
      <div className={styles["sub-table-dropdown"]}>
        <div className={styles["sub-table-toggle"]}>
          {label} <span
            onClick={() => setOpen(prev => !prev)}
          >{"(more)"}</span>
        </div>
        <Collapse in={open}>
          <table>
            <tbody>
              {rows.map(([key, value]) => (
                <tr key={key} className={styles["row"]}>
                  <th className={styles["cell-key"]}>{key}</th>
                  <td className={styles["cell-value"]}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Collapse>
      </div>
    )
  }

  // memoize the sub tables and recompute based on elemenData
  const filteredTags = useMemo(() => {
    const toFilterTags = ['name', 'official_name', 'long_name'];
    const regexes = toFilterTags.map(tag => [tag, new RegExp(`^${tag}.+$`)]);
    const matchedTags = Object.fromEntries(toFilterTags.map(tag => [tag, []]));
    const filteredTags = {};

    // iterate over element data tags
    for (const [key, value] of Object.entries(osmRel.tags)) {
      const found = regexes.find(([tag, regex]) => regex.test(key));
      // populate matches or filter tags
      if (found) {
        matchedTags[found[0]].push([key, value]);
      } else {
        filteredTags[key] = value;
      }
    }

    // Define SubTable and add to corresponding key
    for (const [key, tags] of Object.entries(matchedTags)) {
      if (tags.length > 0) {
        filteredTags[key] = <SubTable
          label={filteredTags[key]}
          rows={tags}
        />
      }
    }

    return filteredTags
  }, [osmRel]);

  return (
    <div>
      <div className={styles["table-container"]}>
        <table className={styles["table"]}>
          <tbody>
            {Object.entries(filteredTags).map(([key, value]) => (
              <tr key={key} className={styles["row"]}>
                <th className={styles["cell-key"]}>{key}</th>
                <td className={styles["cell-value"]}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>)
}