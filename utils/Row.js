/**
 * Represents a row.
 * Each column becomes an instance property, accessible via dot or bracket notation.
 *
 */
export class Row {

    /** Creates a new row. The data stored in the row is suposed to be immutable.
     * @param {Record<string, any>} data - Mapping of column names to cell values.
     */
    constructor(data) {
        // console.log("ROW: ",data);
        Object.assign(this, data);
        Object.freeze(this);
    }
}

