import { useEffect, useState } from "react";
import { fetchTodos, createTodo, deleteTodo, updateTodo} from "../api/todo.api";

const TodoPage = () => {

    const [todos, setTodos] = useState([]);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");

    const [editingId, setEditingId] = useState(null);

    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editDeadline, setEditDeadline] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !description || !deadline) return;
        const newTodo = { name, description, deadline };

        const res = await createTodo(newTodo);

        // update UI list immediately
        setTodos(prev => [res.data.data, ...prev]);

        // reset inputs
        setName("");
        setDescription("");
        setDeadline("");
    };

    const handleDelete = async (id) => {
        try {
            await deleteTodo(id);
            setTodos(prev => prev.filter(todo => todo._id !== id));
        } catch (err) {
            console.error("error deleting todo:", err);
        }
    }

    const handleEdit = (todo) => {
        setEditingId(todo._id);
        setEditName(todo.name);
        setEditDescription(todo.description);
        setEditDeadline(todo.deadline.split("T")[0]
        );
    }


    const handleSave = async (id) => {
            console.log("SAVE CLICKED", id, editName, editDescription, editDeadline);
        try {
            const updatedTodo = {
                name: editName,
                description: editDescription,
                deadline: editDeadline
            };
            await updateTodo(id, updatedTodo);
            setTodos(prev => prev.map(todo => todo._id === id ? { ...todo, ...updatedTodo } : todo));
            setEditingId(null);
        } catch (err) {
            console.error("error updating todo:", err);
        }
    }

    const handleCancel = () => {
        setEditingId(null);
    }

    useEffect(() => {
        fetchTodos()
            .then(res => setTodos(res.data.data))
            .catch(err => console.error("error fetching todos:", err));
    }, [])

    return (
        <div>
            <h1><strong>Todo List</strong></h1>
            <form onSubmit={handleSubmit}>
                <input
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                />
                <button type="submit">Add Todo</button>
            </form>

            <ul>
                {todos.map(todo => (
                    <li key={todo._id}>
                        {editingId === todo._id ? (
                            <>
                                <input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                />
                                <input
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                />
                                <input
                                    type="date"
                                    value={editDeadline}
                                    onChange={(e) => setEditDeadline(e.target.value)}
                                />
                                <button type="button" onClick={() => handleSave(todo._id)}>Save</button>
                                <button type="button" onClick={handleCancel}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <strong>{todo.name}</strong> — {todo.description} — {new Date(todo.deadline).toLocaleDateString()}
                                <button type="button" onClick={() => handleDelete(todo._id)}>Delete</button>
                                <button type="button" onClick={() => handleEdit(todo)}>Edit</button>
                                <button type="toggle" onClick={() => handleToggle(todo._id)}>Toggle</button>
                            </>
                        )}
                    </li>

                ))}
            </ul>
        </div>
    );
};

export default TodoPage;