const express = require("express");

const { celebrate, Joi, Segments } = require("celebrate");

const router = express.Router();
const {
  getMyMovies,
  postMovie,
  deleteMovie,
} = require("../controllers/movies");

const movieSchema = Joi.object({
  country: Joi.string().required(),
  director: Joi.string().required(),
  duration: Joi.number().required(),
  year: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.string()
    .pattern(/^https?:\/\/\w+(\.\w+)*(\.\w+)+(:\d+)?(\/.*)?$/)
    .required(),
  trailerLink: Joi.string()
    .pattern(/^https?:\/\/\w+(\.\w+)*(\.\w+)+(:\d+)?(\/.*)?$/)
    .required(),
  thumbnail: Joi.string()
    .pattern(/^https?:\/\/\w+(\.\w+)*(\.\w+)+(:\d+)?(\/.*)?$/)
    .required(),
  movieId: Joi.number().required(),
  nameRU: Joi.string().required(),
  nameEN: Joi.string().required(),
});

const movieIdValidator = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    movieId: Joi.string().required().length(24).hex(),
  }),
});

router.get("/", getMyMovies);

router.post(
  "/",
  celebrate({
    body: movieSchema,
  }),
  postMovie
);

router.delete("/:movieId", movieIdValidator, deleteMovie);

module.exports = router;
