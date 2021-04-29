const { model } = require('mongoose');

class PremiumData {
    backgroundColor = '#32383d';
    fontColorMain = '#ffffff';
    fontColorSecond = '#9aa2a6';
    buttonColor = '#dc3545';
    badgeColor = '#ffd700';
    directUrl = ''
}

module.exports = model('guild', {
  _id: String,
  status: { type: Boolean, default: true},
  badge: { type: String, default: "" },
  banned: {type: Boolean, default: false},
  uniqueId: { type: String },
  votes: { type: Number, default: 0 },
  isPremium: { type: Boolean, default: false },
  premiumData: { type: Object, default: new PremiumData() },
  description: { type: String, default: "Ustaw opis twojego serwera w panelu!"},
  short_description: { type: String, default: ""}
});