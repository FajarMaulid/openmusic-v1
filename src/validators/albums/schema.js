const Joi = require('joi');

const NotePayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required(),
});

module.exports = { NotePayloadSchema };
