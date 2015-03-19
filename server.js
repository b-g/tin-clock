var express = require("express")
	, app = express()
	, _ = require('underscore')
	, path = require('path')
	, Twitter = require('twitter')
	, PORT = process.env.OPENSHIFT_NODEJS_PORT  || 8000
	, IPADDRESS = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'
	// if OPENSHIFT env variables are present, use the available connection info:
	, DATA_DIR = process.env.OPENSHIFT_DATA_DIR || path.join(__dirname, 'data')
	, config = require(path.join(DATA_DIR, 'config.js'))
	, client = new Twitter({
		consumer_key: config.TWITTER_CONSUMER_KEY,
		consumer_secret: config.TWITTER_CONSUMER_SECRET,
		access_token_key: config.TWITTER_ACCESS_TOKEN_KEY,
		access_token_secret: config.TWITTER_ACCESS_TOKEN_SECRET
	})
	;


app.set('views', './views')
app.set('view engine', 'jade')


/* --------------------------------------------------------- */
/* API */
/* --------------------------------------------------------- */
app.get('/ping', function(req, res) {
	res.send('TIN Clock says pong!');
});

app.get('/trends/available', function(req, res) {
	client.get('trends/available.json', function(error, available, response){
		if(error) return handleError(error, req, res, 404, "404 Not Found");
		res.send(available);
	});
});

app.get('/show/trends/available', function(req, res) {
	client.get('trends/available.json', function(error, available, response){
		if(error) return handleError(error, req, res, 404, "404 Not Found");
		var places = _.sortBy(available, function(p) { return p.country });
		res.render('trend-available.jade', { places: places });
	});
});

app.get('/trends/place/:woeid', function(req, res) {
	var woeid = req.params.woeid;
	client.get('trends/place.json', {id: woeid}, function(error, trends, response){
		if(error) return handleError(error, req, res, 404, "404 Not Found");
		res.send(trends);
	});
});

app.get('/show/trends/place/:woeid', function(req, res) {
	var woeid = req.params.woeid;
	client.get('trends/place.json', {id: woeid}, function(error, trends, response){
		console.log(error)
		if(error) return handleError(error, req, res, 404, "404 Not Found");
		res.render(
			'trend-place.jade',
			{
				name: trends[0].locations[0].name,
				trends: trends[0].trends,
				as_of: trends[0].as_of
			}
		);
	});
});


var handleError = function(err, req, res, statusCode, msg) {
	console.error('%s %s %s', req.url, msg, err || '');
	return res.sendStatus(statusCode);
};

app.listen(PORT, IPADDRESS, function() {
	console.log('TIN Clock on http://%s:%s', IPADDRESS, PORT);
});
