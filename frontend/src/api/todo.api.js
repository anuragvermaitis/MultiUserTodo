import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
 
export const fetchTodos = () => axios.get(API_URL)

export const createTodo = (todo) => axios.post(API_URL, todo);

export const deleteTodo = (id) => axios.delete(`${API_URL}/${id}`);

export const updateTodo = (id, updatedTodo) => axios.put(`${API_URL}/${id}`, updatedTodo);