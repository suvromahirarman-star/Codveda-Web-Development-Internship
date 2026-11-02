const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { validateTaskPayload } = require('../middleware/validateRequest');

router
  .route('/')
  .get(getTasks)
  .post(validateTaskPayload, createTask);

router
  .route('/:id')
  .get(getTaskById)
  .put(validateTaskPayload, updateTask)
  .delete(deleteTask);

module.exports = router;

