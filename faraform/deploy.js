/*global require*/
/*global process*/
/*global module*/
var walk = require('walk');
var Q = require('q');
var fs = require('fs');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var Base64 = require('./js-base64/base64.min.js').Base64;
var mime = require('mime');
var _ = require('lodash');
var request = require('request');
request = request.defaults({
	jar: true
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


var excludedExtensions = ['.eot', '.woff', '.woff2', '.svg', '.ttf', '.odt', '.otf', '.less'];//, '.json', '.png']; // '*.json', '*.png'

var config = {

	username: 'COMPLETEME',
	password: 'COMPLETEME',
	path: './dist/webapp',
	// host: 'https://timesheetsdev.news.co.uk',
	//host: 'https://newseccdev.newsint.co.uk',
	//host: 'https://faraformsdev.news.co.uk',
	host: 'http://vecdci.ds.newsint:8000',
	base: '/sap/bc/bsp_dev/sap/zfara_form/'
};

var i = 1;

function postFile(path) {
	// TODO: handle errors
	var deferred = Q.defer();
	var url = config.host + config.base + path.replace('/dist/webapp', '');
	url = url.replace(/\\/g, "/");
	url = url.replace('./', '');

	var file = fs.readFileSync(path);
	var contentType = mime.getType(path);

	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		if (this.readyState === 4) {
			var now = new Date();
			console.log('UPLOADED: ' + path + " (" + contentType + ") STATUS: " + xhr.status + " TIME: " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds());
			console.log('Uploaded to : ' + url);
			setTimeout(function() {
				deferred.resolve(xhr.status);
			}, 3000);
		}
	};
	xhr.open("PUT", url);

	xhr.setRequestHeader("Authorization", "Basic " + Base64.encode(config.username + ":" + config.password));
	xhr.setRequestHeader("Content-Type", contentType);
	xhr.send(file);
	return deferred.promise;
}

function runDeploy(cb, localconfig) {
	config = _.assign(localconfig, config);
	var files = [];

	var walker = walk.walk(config.path, {
		followLinks: true
	});

	walker.on('file', function(root, stat, next) {
		var exclude = excludedExtensions.some(function(ext) {
			return stat.name.indexOf(ext) != -1;
		});
		if (!exclude) {
			files.push(root + '/' + stat.name);
		} else {
			console.log('IGNORED: ', stat.name);
		}
		next();
	});

	walker.on('end', function() {
		performUpload(files);
	});


	function performUpload(files) {
		function runner() {
			if (files.length) {
				var toRun = files.pop();
				postFile(toRun).then(function() {
					runner();
				});
			} else {
				end();
			}
		}

		function end() {
			console.log('end');
			cb();
		}
		runner();
	}
}

module.exports = {
	runDeploy: runDeploy
};
