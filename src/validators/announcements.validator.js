import { celebrate, Joi, Segments } from 'celebrate'

const categories = ['sale', 'service', 'job', 'other']

export const getAnnouncementsValidator = celebrate({
  [Segments.QUERY]: Joi.object({
    search: Joi.string(),

    sort: Joi.string().valid('newest', 'oldest'),

    page: Joi.number().integer().min(1)
  })
})

export const idValidator = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().integer().required()
  })
})

export const createAnnouncementValidator = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(5).max(100).required(),

    description: Joi.string().min(10).required(),

    price: Joi.number().greater(0).required(),

    category: Joi.string()
      .valid(...categories)
      .required(),

    contactInfo: Joi.string().min(5).required()
  })
})

export const updateAnnouncementValidator = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(5).max(100),

    description: Joi.string().min(10),

    price: Joi.number().greater(0),

    category: Joi.string().valid(...categories),

    contactInfo: Joi.string().min(5)
  }).min(1)
})