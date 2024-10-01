import fs from 'node:fs/promises';

const dbPath = new URL('./db.json', import.meta.url);

export class Database {
    #database = {}

    constructor() {
        fs.readFile(dbPath, 'utf-8')
            .then((data) => this.#database = JSON.parse(data))
            .catch(() => this.#persist());
    }

    #persist() {
        fs.writeFile(dbPath, JSON.stringify(this.#database));
    }

    select(table, id, search) {
        let data = this.#database[table];
        if (!data) return [];

        if (search) {
            data = data.filter(row => {
                return Object.entries(search).some(([key, value]) => {
                    return row[key].toLowerCase().includes(value.toLowerCase())
                })
            })
        }

        if (id) {
            const rowIndex = data.findIndex((row) => row.id === id);
            return rowIndex > -1 ? data[rowIndex] : {};
        }
        
        return data;
    }

    insert(table, data) {
        if (Array.isArray(this.#database[table])) {
            this.#database[table].push(data);
        } else {
            this.#database[table] = [data];
        }

        this.#persist();

        return data;
    }

    delete(table, id) {
        const rowIndex = this.#database[table].findIndex((row) => row.id === id);
        if (rowIndex > -1) {
            this.#database[table].splice(rowIndex, 1);
            this.#persist();
        }
    }

    update(table, id, data) {
        const rowIndex = this.#database[table].findIndex(row => row.id === id)
        if (rowIndex > -1) {
            this.#database[table][rowIndex] = { id, ...data };
            this.#persist();
        }
    }
}
