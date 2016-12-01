var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: String,
  password: String,
  hashed: { type: Boolean, default: false }, 
  date: { type: Date, default: Date.now },
});

UserSchema.pre('save', function(next) {
  if (!this.hashed) {
    this.hashPassword(function(err, user) {
      next();
    });
  } else {
    next();
  }
});

var User = mongoose.model('User', UserSchema);

User.prototype.comparePassword = function(attemptedPassword, callback) {
  bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
    callback(isMatch);
  });
};

User.prototype.hashPassword = function(cb) {
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
      this.hashed = true;
      this.save(function(err, user) {
        cb(err, user);
      });
    });
};

module.exports = User;
