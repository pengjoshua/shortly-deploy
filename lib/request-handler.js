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

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find().exec(function(err, links) {
    res.status(200).send(links);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  Link.findOne({ 'url': uri }, null, function (err, link) {
    if (err) { 
      console.log('Database Error');
      res.redirect('/');
    } else if (!link) {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        } else {
          new Link({
            url: uri,
            title: title,
            baseUrl: req.headers.origin
          }).save(function(err, link) {
            res.status(200).send(link);  
          });
        } 
      });
    } else {
      res.status(200).send(link);
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  User.findOne({ 'username': username }, null, function (err, user) {
    if (err) { 
      console.log('Database Error');
      res.redirect('/login');
    } else if (!user) {
      res.redirect('/login');
    } else {
      user.comparePassword(password, function(match) {
        if (match) {
          util.createSession(req, res, user);
        } else {
          res.redirect('/login');
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ 'username': username }, null, function (err, user) {
    if (err) { 
      console.log('Database Error');
      res.redirect('/signup');
    } else if (!user) {
      new User({ username: username, password: password }).save(function(err, user) {
        util.createSession(req, res, user); 
      });
    } else {
      util.createSession(req, res, user);
    }
  });
};

exports.navToLink = function(req, res) {
  Link.findOne({ code: req.params[0] }, null, function(err, link) {
    if (err) { 
      console.log('Database Error');
      res.redirect('/');
    } else if (!link) {
      res.redirect('/');
    } else {
      link.visits += 1;
      link.save( function(err, link) {
        res.redirect(link.url);  
      });
    }    
  });
};