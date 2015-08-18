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
        var workshops = prismic.getAllDocuments('workshops', ref);
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

        var testimonials = prismic.getAllDocuments('testimonial', ref)
          .then(function (testimonials) {
            return testimonials.filter(function (testimonial) {
              return testimonial.tags.indexOf('lead') === -1;
            });
          });

        Promise.props({
          benefits: getBenefits,
          _homepage: getHomepage,
          pages: pages,
          workshops: workshops,
          testimonials: testimonials
        })
          .then(function (documents) {
            documents.homepage = documents._homepage.homepage;
            documents.testimonial = documents._homepage.testimonial;
            documents.workshops.forEach(function (workshop) {
              var workshopBody = workshop.getGroup('workshops.body').toArray();
              switch(workshop.fragments['workshops.type'].value){
                case 'Current':
                  documents.currentWorkshops = workshopBody;
                  break;
                case 'Past':
                  documents.pastWorkshops = workshopBody;
                  break;
              }
            });

            res.render('index', documents);
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