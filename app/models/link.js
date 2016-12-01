var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var LinkSchema = new Schema({
  url: String, 
  baseUrl: String,
  code: String, //we don't know how to set this yet
  title: String,
  visits: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
});

LinkSchema.pre('save', function(next) {
  console.log('this.code =', this.code);
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

// var Link = db.Model.extend({
//   tableName: 'urls',
//   hasTimestamps: true,
//   defaults: {
//     visits: 0
//   },
//   initialize: function() {
//     this.on('creating', function(model, attrs, options) {
//       var shasum = crypto.createHash('sha1');
//       shasum.update(model.get('url'));
//       model.set('code', shasum.digest('hex').slice(0, 5));
//     });
//   }
// });

module.exports = Link;
