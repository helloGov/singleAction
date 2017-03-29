var Influencer = require('../models/influencer');
var Signup = require('../models/signup');
var passport = require('passport');

var influencerController = {};

influencerController.addInfluencer = function(request, response) {
    var findStr = { email: request.body.email, signupLink: request.body.signupLink };
    Signup.findOne(findStr).exec()
    .then(function(signup) {
        if (signup) {
            Influencer.register(
                new Influencer({
                    firstName: request.body.firstName,
                    lastName: request.body.lastName,
                    username: request.body.username,
                    email: request.body.email
                }),
                request.body.password,
                function(err, account) {
                    if (err) {
                        console.log('error! could not create new influencer: ' + err);
                        response.redirect('/login');
                    } else {
                        console.log(`Signup success! User ${request.body.username}`);
                        Signup.remove(findStr, function() {
                            passport.authenticate('local')(request, response, function() {
                                response.redirect('/home');
                            }, function() {
                                response.redirect('/login');
                            });
                        });
                    }
                }
            );
        } else {
            console.log('Influencer not found in signup database! Influencer: ' + request.body.email + ' link: ' + request.body.signupLink);
            response.end('Error! Influencer not found in signup database');
        }
    })
    .catch(function(reason) {
        console.log('Error! Could not find signup link: ' + reason);
        response.end('Error! Could not find signup link: ' + reason);
    });
};

influencerController.addInfluencerWithFacebook = function(request, response) {
    var findStr = { email: request.body.email, signupLink: request.body.signupLink };
    Signup.find(findStr).exec()
    .then(function(influencer) {
        if (Object.keys(influencer).length !== 0) {
            passport.authenticate('facebook');
        } else {
            console.log('Influencer not found in signup database! Influencer: ' + request.body.email + ' link: ' + request.body.signupLink);
        }
    })
    .catch(function(reason) {
        console.log('Error! Could not find signup link: ' + reason);
    });
};

module.exports = influencerController;