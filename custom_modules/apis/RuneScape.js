var cheerio = require('cheerio');
var moment = require('moment-timezone');

module.exports.forum_profile = async function(username, request_options) {
	const forum_base = 'http://services.runescape.com/m=forum/';
	var encoded_username = encodeURIComponent(username.replace(/[^a-zA-Z0-9 \-_]/g,''));
	var url = forum_base + 'users.ws?lookup=view&searchname=' + encoded_username;
	var selector = '#forums--userview > div > div.contents > main > section.threads-list > article';

	var res = await util.queue_request({url:url, encoding:'ascii'}, request_options);
	var $ = cheerio.load(res.body);
	var posts = [];
	$(selector).each(function(i, e) {
		posts.push({
			section: $(e).find('div.thread-plate__details > p > a.thread-plate__forum-name').text(),
			thread: $(e).find('div.thread-plate__details > h3 > a').text(),
			date: moment.tz($(e).find('a.thread-plate__last-posted').text(), 'DD-MMM-YYYY HH:mm:ss', 'Europe/London').toDate(),
			thread_link: forum_base + $(e).find('div.thread-plate__details > h3 > a').attr('href'),
			showuser_link: forum_base + $(e).find('a.thread-plate__post-by-user').attr('href').replace('%A0','%20'),
		});
	});

	posts = posts.sort( (a,b) => b.date - a.date );

	posts.profile = url;
	posts.name = $('#searchname').val();
	posts.avatar = 'http://services.runescape.com/m=avatar-rs/' + encoded_username + '/chat.png';
	return posts;
}
