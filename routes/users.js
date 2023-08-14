const express = require('express');

const { celebrate, Joi } = require('celebrate');

const router = express.Router();
const {
  updateProfile,
  getUserMe,
} = require('../controllers/users');

const userUpdateSchema = Joi.object().keys({
  name: Joi.string().min(2).max(30).required(),
  email: Joi.string().required().email(),
});

router.get('/me', getUserMe);

router.patch('/me', celebrate({
  body: userUpdateSchema,
}), updateProfile);

module.exports = router;
