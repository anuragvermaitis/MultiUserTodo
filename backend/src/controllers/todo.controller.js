import Todo from "../models/todo.model.js";

/**
 * GET api/v1/todos
 */

export const getTodos = async (req, res) =>{
    try {
       const userId = req.user._id;

       const todos = await Todo.find({ user: userId })
        .populate("user", "name email")
        .sort({completed: 1, createdAt: -1});

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
        const { name, description, deadline, shared, visibility } = req.body;
        const resolvedVisibility = visibility || (shared ? "workspace" : "private");

        const todo = await Todo.create({
            name,
            description,
            deadline: deadline || null,
            visibility: resolvedVisibility,
            shared: resolvedVisibility === "workspace",
            archived: false,
            user: req.user._id,
            workspace: req.user.workspace || null,
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
        const todo = await Todo.findById(id);

        if(!todo){
            return res.status(404).json({
                success: false,
                message: "todo not found"
            });
        }

        if (todo.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "forbidden"
            });
        }

        await Todo.findByIdAndDelete(id);
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
        const { name, description, deadline, completed, shared, visibility, archived } = req.body;

        const todo = await Todo.findById(id);

        if(!todo){
            return res.status(404).json({
                success: false,
                message: "todo not found"
            });
        }

        if (todo.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "forbidden"
            });
        }

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (deadline !== undefined) updates.deadline = deadline || null;
        if (completed !== undefined) updates.completed = completed;
        if (archived !== undefined) updates.archived = archived;
        if (visibility !== undefined || shared !== undefined) {
            const resolvedVisibility = visibility || (shared ? "workspace" : "private");
            updates.visibility = resolvedVisibility;
            updates.shared = resolvedVisibility === "workspace";
        }

        const updated = await Todo.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

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
