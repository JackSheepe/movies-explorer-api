const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { BadRequestErr } = require('../middlewares/BadRequestErr');
const { NotFoundErr } = require('../middlewares/NotFoundErr');
const { ConflictErr } = require('../middlewares/ConflictErr');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => {
      const userData = {
        name: user.name,
        _id: user._id,
      };
      return res.status(201).send(userData);
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictErr('Пользователь с таким Email уже существует'));
      } else if (err.name === 'ValidationError') {
        next(new BadRequestErr(`${Object.values(err.errors).map((error) => error.message).join(', ')}`));
      } else {
        next(err);
      }
    });
};

module.exports.updateProfile = (req, res, next) => {
  const { name, email } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(
    userId,
    { name, email },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundErr('Пользователь с указанным _id не найден');
      }
      const userData = {
        name: user.name,
        _id: user._id,
      };
      return res.status(200).json(userData);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestErr('Переданны некорректные данные'));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { password, email } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });

      res.status(200).send({ token });
    })
    .catch(next);
};

module.exports.getUserMe = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundErr('Пользователь не найден');
      }
      return res.send(user);
    })
    .catch(next);
};
