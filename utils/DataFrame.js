
import { Row } from "./Row.js";
/**
 * Represents a TSV table.
 * Each entry is converted to a Row object.
 */
export class DataFrame {

    /** @type {string} - String that to index the dataframe */
    #primaryKey;

    /** @type {Map<string, Row[]>} - Index mapping PK values to rows. */
    #dataRows;

    /** @type {Row[]} just rows */
    #rows = [];

    /**
     * @param {string} primaryKey - The name of the unique primary key column.
     * @param {Row[]} [rows] - Initial rows to populate the DataFrame.
     */
    constructor(primaryKey, rows = []) {
        this.#primaryKey = primaryKey;
        this.#dataRows = new Map();

        this.size = 0;
        rows.forEach(r => this.addRow(r));
    }

    /** Evaluates if specified key exists
     * @param {string} key Value to check
     * @returns {boolean}
     */
    keyExists(key) {
        return this.#dataRows.has(key);
    }

    /**
     * Appends a row to the DataFrame and updates the primary index.
     * @param {Row} row - The row to append.
     */
    addRow(row) {
        const primaryKey = row[this.#primaryKey];
        if (this.keyExists(primaryKey)) {
            const rows = this.getRowsForKey(primaryKey);
            rows.push(row);
        } else {
            this.#dataRows.set(primaryKey, [row]);
        }
        this.#rows.push(row);
        this.size += 1;
    }

    /** Retrieves rows by its primary key.
     * @param {string} key
     * @returns {Row[]} - returns an array of rows if the key exists. Otherwise, empty array returned
     */
    getRowsForKey(key) {
        //console.log("Consulting rows for key: ",key);
        return this.keyExists(key) ? this.#dataRows.get(key) : [];
    }

    getAllRows() {
        return this.#rows;
    }

    /**
     * Filters rows based on the provided predicate.
     * @param {(row: Row) => boolean} predicate - Function to test each row.
     * @returns {Row[]} Array of rows that match the predicate.
     */
    filter(predicate) {
        return this.#rows.filter(predicate);
    }
}

