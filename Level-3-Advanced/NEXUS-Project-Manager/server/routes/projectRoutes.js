const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { validateProjectPayload } = require('../middleware/validateRequest');

router
  .route('/')
  .get(getProjects)
  .post(validateProjectPayload, createProject);

router
  .route('/:id')
  .get(getProjectById)
  .put(validateProjectPayload, updateProject)
  .delete(deleteProject);

module.exports = router;

