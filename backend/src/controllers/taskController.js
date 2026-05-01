import Task from '../models/Task.js';
import { enqueueTask } from '../config/redis.js';

export const createTask = async (req, res) => {
  try {
    const { title, input, operation } = req.body;

    const task = await Task.create({
      userId: req.userId,
      title,
      input,
      operation
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const runTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = 'pending';
    task.logs = [];
    task.result = null;
    task.logs.push('Task queued');

    await task.save();

    await enqueueTask({
      taskId: task._id.toString(),
      input: task.input,
      operation: task.operation
    });

    res.json({ message: 'Task queued', taskId: task._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
