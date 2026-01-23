import Todo from "../models/todo.model.js";

/**
 * GET api/v1/todos
 */

export const getTodos = async (req, res) =>{
    try {
       const todos = await Todo.find().sort({createdAt: -1});
       
       res.status(200).json({
        success: true,
        count: todos.length,
        data: todos
       });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "couldn't fetch todos",
            error: error.message
        });
    }
};

/**
 * POST api/v1/todos
 */

export const createTodo = async (req, res) => {
    try {
        const { name, description, deadline } = req.body;

        const todo = await Todo.create({
            name,
            description,
            deadline
        });
        res.status(200).json({
            success: true,
            data: todo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "couldn't create todo",
            error: error.message
        });
    }
};

/**
 * DELETE api/v1/todos/:id
 */
export const deleteTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Todo.findByIdAndDelete(id);

        if(!deleted){
            res.status(404).json({
                success: false,
                message: "todo not found"
            })
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "couldn't delete todo",
            error: error.message
        });     
    }
}

/**
 * PUT api/v1/todos/:id
 */
export const updateTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, deadline, completed } = req.body;

        const updated = await Todo.findByIdAndUpdate(
            id,
            { name, description, deadline, completed },
            { new: true }
        );

        if(!updated){
            res.status(404).json({
                success: false,
                message: "todo not found"
            });
        }

        res.status(200).json({
            success: true,
            data: updated
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "couldn't update todo",
            error: error.message
        });     
    }
};