const fmt = '!%-13s %-s\n';
const commands = require('./index.js');

module.exports.permissions = [
	{ user: '*' }
];
module.exports.params = {
	min: 0,
	max: 999,
	help: `Usage: !help`
};
module.exports.command = async function(message, params) {
	var response = '';

	// Sort commands by category
	var sorted = {};
	for(var k in commands)
	{
		var c = commands[k];
		if (!c.help)
			continue; // Help properties not defined
		// Check if this command can be used in this channel
		if (message.check_permissions(config.get('global_permissions').concat(c.permissions)))
		{
			// Create array or append new command
			if (!sorted[c.help.category])
				sorted[c.help.category] = [c];
			else
				sorted[c.help.category].push(c);
		}
	}

	// Output each category in turn
	for(var k in sorted)
	{
		var category = sorted[k];
		response += k + ' commands:\n';
		for(var i in category)
		{
			var c = category[i];
			response += util.printf(fmt, c.help.name, c.help.text);
		}
		response += '\n';
	}

	return Discord.code_block(response);
};
