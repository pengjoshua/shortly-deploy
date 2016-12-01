var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var LinkSchema = new Schema({
  url: String, 
  baseUrl: String,
  code: String,
  title: String,
  visits: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
});

LinkSchema.pre('save', function(next) {
  if (!this.code) {
    this.setCode(function(err, link) {
      next();
    });
  } else {
    next();
  }
});

var Link = mongoose.model('Link', LinkSchema);

Link.prototype.setCode = function (cb) {
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0, 5);
  this.save(function(err, link) {
    cb(err, link);
  });
};

module.exports = Link;
