'use strict';
var prismic = require('./prismic');
var Promise = require("bluebird");

exports.bind = function (app) {
  prismic.initialize()
    .then(function () {
      app.get('/', function (req, res, next) {
        var ref = req.cookies[prismic.previewCookie];
        var getBenefits = prismic.getAllDocuments('benefits', ref)
          .then(function (benefits) {
            return benefits[0].fragments['benefits.body'].value;
          });
        var pages = prismic.getAllDocuments('page', ref)
          .then(function (pages) {
            var pagesHash = {};
            pages.forEach(function (page) {
              pagesHash[page.fragments['page.id'].value] = page;
            });
            return pagesHash;
          });
        var getHomepage = prismic.getHomepage(ref)
          .then(function (homepage) {
            var document = homepage.getLink('homepage.testimonial').document;
            return prismic.getDocumentById(document.type, document.id, ref)
              .then(function (testimonial) {
                return {
                  homepage: homepage,
                  testimonial: testimonial
                }
              });
          });

        Promise.all([getBenefits, getHomepage, pages])
          .then(function (documents) {
            res.render('index', {
              benefits: documents[0],
              homepage: documents[1].homepage,
              testimonial: documents[1].testimonial,
              pages: documents[2]
            });
          })
          .catch(next);
      });


      app.get('/preview', function(req, res) {
        var previewToken = req.query['token'];
        res.cookie(prismic.previewCookie, previewToken, { path: '/', httpOnly: false });
        res.redirect('/');
      })
    })
    .catch(function (e) {
      throw e;
    });
};

