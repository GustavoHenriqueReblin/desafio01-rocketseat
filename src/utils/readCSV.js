import { createReadStream } from 'fs';
import { parse } from 'csv-parse';

const filePath = new URL('../csvFileExample.csv', import.meta.url);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const readCSV = async () => {
    const parser = createReadStream(filePath)
        .pipe(parse({
            from_line: 2,
            delimiter: ',',
        }));

    for await (const row of parser) {
        try {
            const res = await fetch('http://localhost:3333/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: row[0], description: row[1] }),
            });
          
              
            if (!res.ok) throw new Error('Erro ao salvar as tarefas');
        } catch (error) {
            throw new Error('Erro ao salvar as tarefas');
        }

        await delay(1000);
    }
}
