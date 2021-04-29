const SavedGuild = require('./models/guild');

module.exports = new class {
  async get(id) {
    return await SavedGuild.findById(id)
      || await new SavedGuild({ _id: id, uniqueId: await require("./genId")() }).save();
  };
  async getByUniqueId(id) {
    return await SavedGuild.findOne({ uniqueId: id }) || undefined
  }
}