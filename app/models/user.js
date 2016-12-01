var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: String,
  password: String,
  date: { type: Date, default: Date.now },
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
      this.save(function(err, user) {
        cb(err, user);
      });
    });
};

// var User = db.Model.extend({
//   tableName: 'users',
//   hasTimestamps: true,
//   initialize: function() {
//     this.on('creating', this.hashPassword);
//   },
    // comparePassword: function(attemptedPassword, callback) {
    //   bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
    //     callback(isMatch);
    //   });
    // },
  // hashPassword: function() {
  //   var cipher = Promise.promisify(bcrypt.hash);
  //   return cipher(this.get('password'), null, null).bind(this)
  //     .then(function(hash) {
  //       this.set('password', hash);
  //     });
  // }
// });

module.exports = User;
