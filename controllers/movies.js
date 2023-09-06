const Movie = require('../models/movie');
const { BadRequestErr } = require('../middlewares/BadRequestErr');
const { NotFoundErr } = require('../middlewares/NotFoundErr');
const { ForbiddenErr } = require('../middlewares/ForbiddenErr');

module.exports.getMyMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movies) => res.send(movies))
    .catch(next);
};

module.exports.postMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  const owner = req.user._id;
  Movie.create(
    {
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      thumbnail,
      owner,
      movieId,
      nameRU,
      nameEN,
    },
  ).then((movie) => res.status(201).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestErr('Переданны некорректные данные'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  Movie.findOne({ movieId: Number(movieId) })
    .then((movie) => {
      if (!movie) {
        throw new NotFoundErr("Фильм с указанным _id не найден");
      }
      if (req.user._id.toString() !== movie.owner.toString()) {
        throw new ForbiddenErr("Недостаточно прав для выполнения операции");
      }
      Movie.findOneAndDelete({ movieId: Number(movieId) })
        .then(() => {
          res.send({ message: "Фильм удален из списка сохраненых" });
        })
        .catch(next);
    })
    .catch(next);
};
