var cheerio = require('cheerio');
var request = require('request');
var async = require('async');

var unsplash_url = 'http://unsplash.com?page=';
var images = [];

module.exports = {
	crawl: function(options, callback) {
		if(!options) {
			return callback(new Error('options are not defined'));
		}

		var start_page = options.start_page ? options.start_page : 1;
		var end_page = options.end_page ? options.end_page : 5;

		var pages = [];
		for (var i = start_page; i <= end_page; i++) {
			pages.push(i);
		}

		async.each(pages, perPage, function (err) {
			callback(err, images);
		});
	}
};

function perPage(page, callback) {
	request(unsplash_url + page, function(error, response, body) {
		if(error) {
			callback(error);
		} else if (response.statusCode == 200) {
			$ = cheerio.load(body);
			var image = {};
			$('a', '.epsilon').each( function(index, element) {
				var text = $(this).text();
				if( text === 'Download') {
					image = {image_link: $(this).attr('href')};
				} else if( text !== 'Subscribe' && text !== 'do whatever you want' ) {
					image.author = $(this).text();
					image.author_link = $(this).attr('href');
					images.push(image);
				}
			});
			callback();
		} else {
			console.log(response.statusCode);
			callback(new Error('Could not request unsplash'));
		}
	});
}
