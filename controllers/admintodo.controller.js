const asyncHandler = require("express-async-handler");
const TodoModel = require("../models/todos.model");
const pick = require("../middleware/pick");
const mongoose = require("mongoose");

// Get all todos (for admin)
const getTodos = async (req, res) => {
    try {
        const options = pick(req.query, ['limit', 'page', 'searchBy']);
        options.limit = Number(options.limit) || 10; // Default limit
        options.page = Number(options.page) || 1; // Default page
        const skip = (options.page - 1) * options.limit;

        let query = {};
        if (options.searchBy) {
            // If search query is provided, add a regex search condition for title and description
            query.$or = [
                { title: { $regex: options.searchBy, $options: 'i' } }, // Case insensitive search
                { description: { $regex: options.searchBy, $options: 'i' } }
            ];
        }

        const totalDocs = await TodoModel.countDocuments(query);
        const data = await TodoModel.find(query).skip(skip).limit(options.limit);

        if (!data || data.length === 0) {
            const data1 = [{ title: "No Task To Display", createdAt: null, description: "Please Add Task" }];
            return res.status(404).json({ message: "Not found", data: data1 });
        } else {
            res.status(200).json({ message: "Success", total: totalDocs, data });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Create a new todo (for admin)
const createTodo = async (req, res) => {
    const { title, description, user_id } = req.body; // Assuming user_id is provided in the request body
    if (!title || !description || !user_id) {
        return res.status(400).json({ message: 'All fields are mandatory' });
    }

    try {
        const data = await TodoModel.create(req.body);
        res.status(201).json({ message: "Success", data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Edit a todo (for admin)
const editTodo = async (req, res) => {
    const id = req.params.id;
    try {
        const updatedData = await TodoModel.findByIdAndUpdate(id, req.body, {
            new: true, // Return the updated document after the update
        });
        if (!updatedData) {
            return res.status(404).json({ error: 'Document not found' });
        }
        res.json({ message: "Success", data: updatedData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete a todo (for admin)
const deleteTodo = async (req, res) => {
    const id = req.params.id;
    try {
        const deletedData = await TodoModel.findByIdAndDelete(id);
        if (!deletedData) {
            return res.status(404).json({ error: 'Document not found' });
        }
        res.status(200).json({ message: "Successfully deleted", data: deletedData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { getTodos, createTodo, editTodo, deleteTodo };