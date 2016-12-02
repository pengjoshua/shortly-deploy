'use strict';

var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = Promise.coroutine(function* (req, res) {
  yield Promise.resolve(req.session.destroy()); 
  return res.redirect('/login');
});

exports.fetchLinks = Promise.coroutine(function* (req, res) {
  var links = yield Promise.resolve(Link.find().exec()); 
  return res.status(200).send(links);
});

exports.saveLink = Promise.coroutine(function* (req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  try {
    var link = yield Promise.resolve(Link.findOne({ 'url': uri }, null));
    if (!link) {
      try {
        var title = yield Promise.resolve(util.getUrlTitle(uri));
        var link = new Link({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        });
        link = yield Promise.resolve(link.save());
        return res.status(200).send(link); 
      } catch (e) {
        console.log('Error reading URL heading: ', err);
        return res.sendStatus(404);
      }
    } else {
      return res.status(200).send(link);
    }
  } catch (e) {
    console.log('Database Error');
    return res.redirect('/');
  }
});

exports.loginUser = Promise.coroutine(function* (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  try {
    var user = yield Promise.resolve(User.findOne({ 'username': username }, null));
    if (!user) {
      return res.redirect('/login');
    } else {
      var match = yield Promise.resolve(user.comparePassword(password));
      if (match) {
        return util.createSession(req, res, user);
      } else {
        return res.redirect('/login');
      }
    }
  } catch (e) {
    console.log('Database Error');
    return res.redirect('/login');
  }
});

exports.signupUser = Promise.coroutine(function* (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  try {
    var user = yield Promise.resolve(User.findOne({ 'username': username }, null));
    if (!user) {
      user = new User({ username: username, password: password });
      user = yield Promise.resolve(user.save());
      return util.createSession(req, res, user);
    } else {
      return util.createSession(req, res, user);
    }
  } catch (e) {
    console.log('Database Error');
    return res.redirect('/signup');
  }
});

exports.navToLink = Promise.coroutine(function* (req, res) {
  try {
    var link = yield Promise.resolve(Link.findOne({ 'code': req.params[0] }, null));
    if (!link) {
      return res.redirect('/');
    } else {
      link.visits += 1;
      link = yield Promise.resolve(link.save());
      return res.redirect(link.url);
    }
  } catch (e) {
    console.log('Database Error');
    return res.redirect('/');
  }
});