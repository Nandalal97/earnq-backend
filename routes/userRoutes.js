const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUserById } = require('../controllers/userController');
const { validateUserProfileUpdate } = require('../middleware/userValidation');
const verifyToken = require('../middleware/verifyToken');

router.get('/users', getAllUsers);
router.get('/users/user/:id',verifyToken, getUserById);
router.put('/users/user/edit/:id', validateUserProfileUpdate, updateUserById);

module.exports = router;
