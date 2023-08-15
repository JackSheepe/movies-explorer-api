const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const { UnauthorizedErr } = require('../middlewares/UnauthorizedErr');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Владимир',
      minlength: [2, 'Минимальная длина поля name - 2'],
      maxlength: [30, 'Максимальная длина поля name - 30'],
    },
    email: {
      type: String,
      unique: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: 'Email не верен',
      },
    },
    password: {
      type: String,
      minlength: [8, 'Минимальная длина поля пароль - 8'],
      select: false,
    },
  },
  { versionKey: false },
);

userSchema.statics.findUserByCredentials = function FUBC(email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedErr('Неправильные почта или пароль');
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedErr('Неправильные почта или пароль');
          }

          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
