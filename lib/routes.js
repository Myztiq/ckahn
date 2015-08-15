'use strict';
var prismic = require('./prismic');

exports.bind = function (app) {
  prismic.initialize()
    .then(function () {
      app.get('/', function (req, res, next) {

        prismic.getPage('index')
          .then(function (page) {
            res.render('index', {
              doc: page
            });
          })
          .catch(next);
      });
    })
    .catch(function (e) {
      throw e;
    });
};