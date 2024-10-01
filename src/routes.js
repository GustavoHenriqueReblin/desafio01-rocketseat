import { randomUUID } from 'node:crypto';
import { Database } from './database/database.js';
import { buildRoutePath } from './utils/buildRoutePath.js';

const database = new Database();

export const routes = [
    // Busca as tarefas
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { search } = req.query;
            const tasks = database.select('task', undefined, search ? {
                title: search,
                description: search,
            } : undefined);

            return res.end(JSON.stringify(tasks));
        },
    },
    // Cria uma tarefa
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            try {
                const { title, description } = req.body;

                if (!title || !description) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({
                        error: 'Erro na validação dos campos.',
                        message: 'É necessários definir "title" e "description".'
                    }));
                }

                database.insert('task', 
                    {
                        id: randomUUID(),
                        title,
                        description,
                        completed_at: null,
                        created_at: new Date(),
                        updated_at: null,
                    }
                )

                return res.writeHead(201).end();
            } catch (error) {
                return res.writeHead(500).end(error);
            }
        },
    },
    // Deleta uma tarefa
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            try {
                const { id } = req.params;

                const task = database.select('task', id);
                if (!task || Object.keys(task).length === 0) {
                    res.writeHead(404);
                    return res.end(JSON.stringify({
                        error: 'Task não encontrada.',
                        message: 'A tarefa solicitada não existe.'
                    }));
                }

                database.delete('task', id);
                return res.end();
            } catch (error) {
                return res.writeHead(500).end(error);
            }
        },
    },
    // Atualiza uma tarefa
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            try {
                const { id } = req.params;
                const { title, description } = req.body;

                if (!title && !description) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({
                        error: 'Erro na validação dos campos.',
                        message: 'É necessários definir "title" ou "description".'
                    }));
                }

                const task = database.select('task', id);
                if (!task || Object.keys(task).length === 0) {
                    res.writeHead(404);
                    return res.end(JSON.stringify({
                        error: 'Task não encontrada.',
                        message: 'A tarefa solicitada não existe.'
                    }));
                }

                const taskUpdated = {
                    title: title || task.title,
                    description: description || task.description,
                    completed_at: task.completed_at,
                    created_at: task.created_at,
                    updated_at: new Date(),
                };

                database.update('task', id, taskUpdated);
                return res.end();
            } catch (error) {
                return res.writeHead(500).end(error);
            }
        },
    },
    // Atualiza uma tarefa para concluída ou a fazer
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {
            try {
                const { id } = req.params;

                const task = database.select('task', id);
                if (!task || Object.keys(task).length === 0) {
                    res.writeHead(404);
                    return res.end(JSON.stringify({
                        error: 'Task não encontrada.',
                        message: 'A tarefa solicitada não existe.',
                        status: 404
                    }));
                }

                const taskUpdated = {
                    title: task.title,
                    description: task.description,
                    completed_at: task.completed_at === null ? new Date() : null,
                    created_at: task.created_at,
                    updated_at: new Date(),
                };

                database.update('task', id, taskUpdated);
                return res.end();
            } catch (error) {
                return res.writeHead(500).end(error);
            }
        },
    },
];
