## Setup
You MUST set up config.js in the config folder with your bot token before starting the bot. You can get a bot token from the Discord site: https://discordapp.com/developers/applications/me

Node 7.6 or higher is recommended. If you use an earlier version, you will need to use a transpiler or harmony flags for async/await support.
```bash
npm install
npm start
```

## Command Format
Commands are detected and parsed in **./main.js**. Every command consists of !, followed by the command name, followed by a comma separated list of parameters.

For example, if a user sends the message `!price dragon warhammer, dfs`, the command name is `price`, and there are two parameters, `dragon warhammer` and `dfs`.

## Adding a Command
Every command is a separate file in the **./custom_modules/commands** folder. The name of the file is used as the command name. For example, if you want a command `!hw`, you should add it in a file at **./custom_modules/commands/hw.js**

Every command must export help properties, permissions, and a function that performs the command and optionally returns a message to be sent back to the user who initiated it. An example is shown below:
```javascript
module.exports.help = {
	// The name of the command without !
	name: 'hw',
    // A short description of what the command does, used to generate !commands output
	text: 'A quick message to the world.',
    // All commands with the same category will be grouped together in !commands output.
	category: 'General'
};
module.exports.params = {
	// The minimum allowed number of command parameters
	min: 0,
	// The maximum allowed number of command parameters
	max: 0,
	// If the wrong number of parameters are given, this message is sent back in response.
	help: 'Usage: !hw'
};

module.exports.permissions = [
	{ user: '*' } // All users may use this command
];

module.exports.command = async function(message, params) {
	// Send this text back to the user
	return 'Hello world!';
};
```

The main work of each command happens in the module.exports.command function. This function always takes two parameters, `message` and `params`.

`message` is a discord.js [message object](https://discord.js.org/#/docs/main/stable/class/Message) that is the discord message that initiated the command.

`params` is an array of strings representing parameters passed to the command. For example, if the message was `!price dragon warhammer, dfs`, then `params[0] = 'dragon warhammer'` and `params[1] = 'dfs'`.

If the command function returns a string or (RichEmbed)[https://discord.js.org/#/docs/main/stable/class/RichEmbed], it will be sent to the channel the message was sent in. If you return an array of strings or embeds, they will be sent as separate messages. If the string you return is longer than the 2000 character message limit, it will be split into smaller messages and sent that way.

## Permissions
Permissions are always evaluated in the context of a message. Permissions are represented as an array of "rules". Rules are evaluated one at a time from the first rule to the last. The first matching rule decides whether to allow or deny an action. Rules can act on the message's channel, guild, channel type, author and author roles.

#### Basic Permissions Example
```
[
	{ channel: '232616777220096001', block: true },
	{ user: '288470745972080640' }
]
```
The first rule is against the message channel. If the channel id is 232616777220096001, then the action is blocked. The second rule is against the message author. If the author's id is 288470745972080640, the action is allowed. You can specify block: false, but it is not required. By default, if no rules match, the action is **blocked**.

#### Permissions Complement Example
```
[
	{ not_user: '288470745972080640' }
]
```
Here we only have one rule. If the author of the message is NOT 288470745972080640, then the action is allowed. If the author of the message is 288470745972080640, the rule does not match and the default is to block.

#### Matching Multiple IDs
```
[
	{ not_channel: ['275684827062206465', '281925269919367168'], block: true },
	{ user: '*' }
]
```
It is possible to pass an array of ids to be matched by a rule. The first rule blocks if the message is from any channel except the two listed in the array. The second rule demonstrates the special string '\*'. If '\*' is passed in place of an id, it matches every id. This permission set allows any user in the two channels listed and blocks all others.

#### Filtering on Channel Type
```
[
	{ channel_type: [ 'dm', 'group' ], block: true }
	{ channel_type: 'text' }
]
```
The three types of channels are 'dm' (private message channels), 'group' (group private message channels) and 'text' (guild text channels). This permission set blocks messages in private channels, but allows messages from guild channels.

#### Combining Multiple Filters
```
[
	{ guild: '232274245848137728', role: '278959310481129473' },
	{ guild: '232274245848137728', user: ['228019028755611648', '288470745972080640'] }
]
```
Rules can filter on combinations of user, channel, guild, and roles. The first rule of this set allows users with role 278959310481129473 in guild 232274245848137728. The second rule allows two specific users in the same guild. Any other users will be blocked by default for not matching any previous rules.

#### Global Permissions
There is a set of permissions defined in config.js which is evaluated before any command permissions. It is a good idea to add a rule there allowing the bot owner to run any command ie:
```
	global_permissions: [
		{ user: '<YOUR ID HERE>' }
	]
```
Global permissions are useful to block commands being used in or out of specific channels or guilds:
```
	global_permissions: [
		{ not_guild: '<MY FAVORITE GUILD ID>', block: true },
		{ user: '<YOUR ID HERE>' }
	]
```

## Files and Folders Overview
* main.js<br>
Entry point for the bot. Handles bot startup and parsing commands and some help messages.
<br><br>
* custom_modules/apis<br>
Every file in this folder is loaded in a global object named `apis`. For example, one could look up a player's oldschool stats with `var stats = await apis.RuneScape.lookup_player('zezima');`, without needing to require anything.
<br><br>
* custom_modules/commands<br>
Every file in this folder is a command, defining help, permissions, and a function to perform it.
<br><br>
* custom_modules/discord_utils<br>
'discord.js' is loaded globally under the name `Discord`. Files in this folder augment `Discord` with custom functions to aid in writing commands, such as markdown formatting functions.
<br><br>
* custom_modules/util<br>
A collection of useful functions loaded globally under the name `util`.
<br><br>
* custom_modules/console_hook.js<br>
Hook console.* adding filename output, colors, and custom json formatting. Just a convenience thing.
<br><br>
* custom_modules/singleinstance.js<br>
Sets up an IPC server listening for a new instance of the bot, and shuts down when one is found. Very likely only useful in a Windows dev environment (for me, ctrl+c doesn't kill the node process, only npm).
<br><br>
* price_data<br>
Contains files that help the price checker do its thing (abbreviations dictionary, item groups lookup, item ids lookup).

## Global Variables
This is a personal project with one developer, and I get lazy sometimes. As such, there are a few global variables you should be aware of:
```
global
	.server_directory // Path of project root
	.custom_require(path) // require() relative to custom_modules
	.root_require(path) // require() relative to project root
	.apis
		.CrystalMathLabs
			.get_clan_list()
			.update_player(player_name)
			.player_last_change(player_name)
			.time_to_max(player_name)
		.RSBuddy
			.get_item_proper_name(name)
			.get_item_id(name)
			.get_item_summary(name)
			.get_similar_items(name)
			.get_item_history(id, start, interval)
			.get_item_details(name)
		.RuneScape
			.lookup_player(username)
			.combat_level(stats)
			.forum_profile(username)
			.calculate_time(xp, target_xp)
			.max_ehp
	.util
		.approximate_time(t1, t2) // time between dates as string eg "3 weeks, 2 days"
		.convert_time(seconds)
		.format_number(value, num_decimals)
		.fuzzy_match(needle, haystack, weights)
		.printf(string, ...values)
		.queue_request(site, options)
		.request(url_or_options)
		.sleep(ms) // promise resolves after ms milliseconds
		.table
	.config
		.get(key)
	.Discord
		.bot // discord.js client object
		.italics(text) // apply discord italics markdown to text
		.bold(text)
		.bold_italics(text)
		.strikeout(text)
		.underline(text)
		.underline_italics(text)
		.underline_bold(text)
		.underline_bold_italics(text)
		.code_block(text)
		.inline_code(text)
		.link(link) // A link that doesnt create an embed
		.masked_link(text, link) // Create a 'spoofy' link (RichEmbed only)        
		.get_text_channel(channel_name)
		.get_dm_channel(recipient)
		.get_user(recipient)
```

## Making GET Requests
If your bot needs to make GET requests, you can use `util.queue_request(site, options)`. This is a wrapper over the plain request npm module. It allows requests to be queued up, adding a delay if necessary so as to limit the request rate to a particular host. It is highly recommended to use queue_request to avoid hitting servers with too many requests in a short period of time. For example:
```
var res = await util.queue_request('mysite.com', {
	success_delay: 2000,
	failure_delay: 5000,
	max_attempts: 10
});
res.statusCode => http status code
res.body => http body
```
With this, a GET request will be made to mysite.com. If successful, the response is immediately returned. If the server cannot respond, another GET request will be made after 5000 milliseconds. This will be attempted up to 10 times before giving up (rejecting the promise). If, somewhere else in the code, another call to queue_request is made on mysite.com before this one is complete, it will be delayed automatically. When the first request completes successfully, the new queue_request will run after 2000 milliseconds. Only one request can be made to each unique hostname at a time. Requests to different hosts are allowed to run in parallel (you can have a request looking up stats from runescape.com and a request looking up item prices from rsbuddy.com at the same time, but not two requests to runescape.com).
```
var res = await util.queue_request('mysite.com', {
	priority: 10,
	codes: [200, 404]
});
```
queue_request can also prioritize requests. The default priority is 0. Higher values give higher priority and whenever a new request can start, queue_request always chooses first by highest priority, then by longest wait time if the priorities are equal. Priority is useful if you want to implement some background requests while still having requests made by a user command happen as soon as possible.

There is also support for checking http status codes and retrying if a satisfactory code is not received.  In the example above, queue_request will keep retrying until it receives a response with status 200 or status 404.
