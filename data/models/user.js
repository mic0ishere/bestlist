const { model } = require('mongoose');

module.exports = model('user', {
  _id: String,
  voteCooldown: { type: Number, default: 0}
});