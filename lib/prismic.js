var Promise = require("bluebird");
var Prismic = require('prismic.io').Prismic;
var Predicates = Prismic.Predicates;

if (!process.env.ACCESS_TOKEN) {
  throw new Error('ACCESS_TOKEN is required as an ENV var.');
}

var Api = null;
module.exports = {
  initialize: function () {
    return new Promise(function (resolve, reject) {
      Prismic.Api('https://carolkahn.prismic.io/api', function (err, _Api) {
        if ( err ) {
          reject(err);
        }
        Api = _Api;
        resolve(Api);
      }, process.env.ACCESS_TOKEN);
    });
  },
  getHomepage: function (ref) {
    ref = ref || Api.master();
    return Promise.fromNode(function(callback) {
      Api
        .form('everything')
        .ref(ref)
        .query(
        Predicates.at("document.type", "homepage")
      )
        .submit(callback);
    })
      .then(function (results) {
        return results.results[0];
      })
  },
  getPage: function (pageId, ref) {
    ref = ref || Api.master();
    return Promise.fromNode(function(callback) {
      Api
        .form('everything')
        .ref(Api.master(ref))
        .query(
          Predicates.at("document.type", "page"),
          Predicates.at("my.page.id", pageId)
        )
        .submit(callback);
    })
      .then(function (results) {
        return results.results[0];
      })
  },
  getDocumentById: function(document, id, ref){
    ref = ref || Api.master();
    return Promise.fromNode(function(callback) {
      Api
        .form('everything')
        .ref(ref)
        .query(
        Predicates.at("document.type", document),
        Predicates.at("document.id", id)
      )
        .submit(callback);
    })
      .then(function (results) {
        return results.results[0];
      })
  },
  getAllDocuments: function(document, ref){
    ref = ref || Api.master();
    return Promise.fromNode(function(callback) {
      Api
        .form('everything')
        .ref(ref)
        .query(
        Predicates.at("document.type", document)
      )
        .submit(callback);
    })
      .then(function (results) {
        return results.results;
      })
  },
  previewCookie: Prismic.previewCookie
};
