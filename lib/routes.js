'use strict';
var prismic = require('./prismic');
var Promise = require("bluebird");

exports.bind = function (app) {
  prismic.initialize()
    .then(function () {
      app.get('/', function (req, res, next) {
        var getBenefits = prismic.getAllDocuments('benefits')
          .then(function (benefits) {
            return benefits[0].fragments['benefits.body'].value;
          });
        var getHomepage = prismic.getHomepage()
          .then(function (homepage) {
            var document = homepage.getLink('homepage.testimonial').document;
            return prismic.getDocumentById(document.type, document.id)
              .then(function (testimonial) {
                return {
                  homepage: homepage,
                  testimonial: testimonial
                }
              });
          });

        Promise.all([getBenefits, getHomepage])
          .then(function (documents) {
            res.render('index', {
              benefits: documents[0],
              homepage: documents[1].homepage,
              testimonial: documents[1].testimonial
            });
          })
          .catch(next);
      });
    })
    .catch(function (e) {
      throw e;
    });
};