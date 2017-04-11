// Set up special require functions relative to certain directories
global.custom_require = name => require(global.server_directory + '/custom_modules/' + name);
global.root_require   = name => require(global.server_directory + '/' + name);

custom_require('console_hook');	// This must be the first require for colors to work

// Load config
global.config = Object.assign(
	root_require('config/default_config.js'),
	root_require('config/config.js')
);

// Load utilities
global.util = custom_require('util');
global.apis = custom_require('apis');

// Load Discord
global.Discord = require('discord.js');
custom_require('discord_utils');
Discord.bot = new Discord.Client();
