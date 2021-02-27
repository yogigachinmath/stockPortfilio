const Joi = require('joi');

const transferSchema = Joi.object().keys({
  type: Joi.string()
    .trim()
    .required()
    .valid(...['add', 'remove']),
  amount: Joi.number().greater(0).required(),
});
const transactionSchema = Joi.object().keys({
  type: Joi.string()
    .trim()
    .required()
    .valid(...['buy', 'sell']),
  quantity: Joi.number().greater(0).required(),
  ticker: Joi.string().trim().required(),
});

async function validateTransferSchema(req, res, next) {
  try {
    await transferSchema.validateAsync(req.body);
    next();
  } catch (err) {
    next({ Error: 'Validation', msg: err.message });
  }
}
async function validateTransactionSchema(req, res, next) {
  try {
    await transactionSchema.validateAsync(req.body);
    next();
  } catch (err) {
    next({ Error: 'Validation', msg: err.message });
  }
}

module.exports = {
  validateTransferSchema,
  validateTransactionSchema,
};
