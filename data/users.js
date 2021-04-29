const User = require('./models/user');

module.exports = new class {
  async get(id) {
    return await User.findById(id)
      || await new User({ _id: id }).save();
  };
}