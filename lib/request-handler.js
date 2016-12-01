var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
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
    console.log('In FetchLinks', links);
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
      console.log('link not found - create one');
      // do work here
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
            link.setCode(function(err, link) {
              res.status(200).send(link);  
            });
          });
        }
      });
    } else {
      console.log('link already exists', link);
      res.status(200).send(link);
    }
  });

  // new Link({ url: uri }).fetch().then(function(found) {
  //   if (found) {
  //     res.status(200).send(found.attributes);
  //   } else {
  //     util.getUrlTitle(uri, function(err, title) {
  //       if (err) {
  //         console.log('Error reading URL heading: ', err);
  //         return res.sendStatus(404);
  //       }
  //       var newLink = new Link({
  //         url: uri,
  //         title: title,
  //         baseUrl: req.headers.origin
  //       });
  //       newLink.save().then(function(newLink) {
  //         //Links.add(newLink);
  //         res.status(200).send(newLink);
  //       });
  //     });
  //   }
  // });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  User.findOne({ 'username': username }, 'username password', function (err, user) {
    if (err) { 
      console.log('Database Error');
      res.redirect('/login');
    } else if (!user) {
      console.log('user not found');
      res.redirect('/login');
    } else {
      console.log('user found', user);
      
      // if (user.password === password) {
      //   console.log('Password match');
      //   util.createSession(req, res, user);
      // } else {
      //   console.log('Password MisMatch');
      //   res.redirect('/login');
      // }
      user.comparePassword(password, function(match) {
        if (match) {
          console.log('Password match');
          util.createSession(req, res, user);
        } else {
          console.log('Password MisMatch');
          res.redirect('/login');
        }
      });
    }
  });


  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       res.redirect('/login');
  //     } else {
  //       user.comparePassword(password, function(match) {
  //         if (match) {
  //           util.createSession(req, res, user);
  //         } else {
  //           res.redirect('/login');
  //         }
  //       });
  //     }
  //   });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ 'username': username }, 'username', function (err, user) {
    if (err) { 
      console.log('Database Error');
      res.redirect('/signup');
    } else if (!user) {
      console.log('user not found - create one');
      // do work here
      new User({ username: username, password: password }).save(function(err, user) {
        user.hashPassword(function(err, user) {
          console.log(user);
          util.createSession(req, res, user); 
        });
      });
    } else {
      console.log('user already exists', user);
      res.redirect('/login');
    }
  });
};

exports.navToLink = function(req, res) {
  Link.findOne({ code: req.params[0] }, null, function(err, link) {
    if (err) { 
      console.log('Database Error');
      res.redirect('/');
    } else if (!link) {
      console.log('link not found');
      // do work here
      res.redirect('/');
    } else {
      console.log('Link found', link);
      link.visits += 1;
      link.save( function(err, link) {
        res.redirect(link.url);  
      });
    }    
  });

  // new Link({ code: req.params[0] }).fetch().then(function(link) {
  //   if (!link) {
  //     res.redirect('/');
  //   } else {
  //     link.set({ visits: link.get('visits') + 1 })
  //       .save()
  //       .then(function() {
  //         return res.redirect(link.get('url'));
  //       });
  //   }
  // });
};