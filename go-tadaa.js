var _ = require('underscore'),
request = require('request'),
S = require('string'),
xml2json = require('node-xml2json');

var gotadaa = {};

gotadaa._getJson = function(username, password, url, done) {
  var auth = "Basic " + new Buffer(username + ":" + password).toString("base64");
  request.get({
    url: url,
    headers: {
      "Authorization": auth
    }
  },
  function(error, response, body) {
    if (error) {
      return done(error);
    }

    var json = {};
    if(body) {
      json = xml2json.parser(body);
    }

    return done(null, json);
  });
};

gotadaa._getFailedProjects = function(allProjects, projectNameStartsWith) {
  var projects = _.values(allProjects)[0].project;
  var required = _.filter(projects, function(p) { return S(p.name).startsWith(projectNameStartsWith); });
  var failed = _.filter(required, function(p) { return p.lastbuildstatus == 'Failed'} );
  return failed;
};

gotadaa.getNumberOfFailures = function(options, done) {
  console.log('Checking Go server...');
  gotadaa._getJson(options.username, options.password, options.url, function(e, data) {
    if(e) {
      console.error(e);    
      return done(null, null);
    }
    
    var failed = gotadaa._getFailedProjects(data, options.project);
    console.log(failed.length + ' failing projects');
    return done(null, failed.length);
  });
};

module.exports = gotadaa;
