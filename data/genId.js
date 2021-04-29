const SavedGuild = require("./models/guild");
class Robot {
  constructor() {
    this.name = Robot.makeId();
  }
  static makeId() {
    var text =
      Array.from(
        { length: 2 },
        (_) => Robot.chars[~~(Math.random() * 26)]
      ).join("") +
      Array.from({ length: 3 }, (_) => Robot.nums[~~(Math.random() * 10)]).join(
        ""
      );
    return !Robot.idmap[text]
      ? ((Robot.idmap[text] = true), text)
      : Robot.makeId();
  }
}
Robot.nums = Array.from({ length: 10 }, (_, i) => i);
Robot.chars = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
Robot.idmap = {};
async function genId() {
  const id = new Robot();
  if (!(await SavedGuild.findOne({ uniqueId: id.name }))) return id.name;
  else await genId();
}
module.exports = async function () {
  return genId();
};
