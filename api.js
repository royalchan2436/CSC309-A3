// require some functions model
var http = require("http");
var fs = require("fs");
var qs = require("querystring");

// read json file and convert into JSON object
var jsonObj;
fs.readFile("sample.json", function(err, data) {
	jsonObj = JSON.parse(data);
});

var app = http.createServer(function(req, res){
	var postData = "";
	
	
	if (req.method === "GET") {
		// Request index.html
		if (req.url == '/index.html' || req.url == '/') {
			fs.readFile("index.html", function(err, data) {
				if (err) throw err;

				res.writeHeader(200, {"Content-Type":"text/html"});
				res.write(data.toString());

				res.end();
			})
		} else if (req.url == '/jquery.js') {
			// Request jquery.js
			fs.readFile("jquery.js", function(err, data) {
				if (err) throw err;
				res.writeHeader(200, {"Content-Type":"text/html"});
				res.write(data.toString());
				res.end();
			});
		}
	} else if (req.method === "POST") {
		
		req.on("data", function(chunck) {
			postData += chunck;
		})
		
		// get all post data and to do something
		req.on("end", function() {
			var post = qs.parse(postData);
			
			if (post.all_tweets) {
				// Get all tweets
				var resultArr = [];
				for (var i in jsonObj) {
					resultArr.push({'created_at':jsonObj[i]['created_at'],'id':jsonObj[i]['id_str'],'text':jsonObj[i]['text']});
				}
				
				res.end(JSON.stringify(resultArr));
			} else if (post.all_users) {
				// Get all known Twitter users included in the archive
				var resultArr = [];
				for (var i in jsonObj) {					
					resultArr.push({'user_id':jsonObj[i]['user']['id_str'],'screen_name':jsonObj[i]['user']['screen_name']});
					
					if (jsonObj[i].entities && jsonObj[i].entities.user_mentions) {
						for (var j in jsonObj[i].entities.user_mentions) {
							resultArr.push({'user_id':jsonObj[i].entities.user_mentions[j].id_str,'screen_name':jsonObj[i].entities.user_mentions[j].screen_name});
						}
					}
				}
				
				res.end(JSON.stringify(resultArr));
			} else if (post.all_links) {
				
				// Get a list of all external links 
				var resultArr = [];
				for (var i in jsonObj) {
					var tempArr = {};
					tempArr.id = jsonObj[i].id_str;
					var tempStr = JSON.stringify(jsonObj[i]);
					var patten = tempStr.match(/http:\/\/[^"\s\\]+/g);
					
					var links = [];
					for (var j=0; j<patten.length; j++) {
						links.push(patten[j]);
					}

					tempArr.links = links;
					resultArr.push(tempArr);
				}
				
				res.end(JSON.stringify(resultArr));
			} else if (post.tweet_id) {
				
				// Get the details about a given tweet
				var resultArr = {};
				for (var i in jsonObj) {
					if (jsonObj[i].id_str == post.tweet_id) {
						resultArr.id = post.tweet_id;
						resultArr.created_at = jsonObj[i].created_at;
						resultArr.text = jsonObj[i].text;
						resultArr.screen_name = jsonObj[i].user.screen_name;
						break;
					}
				}
				
				res.end(JSON.stringify(resultArr));
			} else if (post.user_name) {
				
				// Get detailed profile information about a given Twitter user 
				var resultArr = {};
				for (var i in jsonObj) {
					if (jsonObj[i].user.screen_name == post.user_name) {
						resultArr.screen_name = jsonObj[i].user.screen_name;
						resultArr.name = jsonObj[i].user.name;
						resultArr.location = jsonObj[i].user.location;
						resultArr.description = jsonObj[i].user.description;
						resultArr.id = jsonObj[i].user.id_str;
						break;
					}
				}
				
				res.end(JSON.stringify(resultArr));
			} else {
				res.end('Not supported');
			}
		})
	} else {
		console.log("Not supported");
	}
})

//use port 3000
app.listen(3000);