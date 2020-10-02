blitzbot [![Build Status](https://travis-ci.org/CodeMan99/blitzbot.svg?branch=master)](https://travis-ci.org/CodeMan99/blitzbot)
========

Statistics chat bot for World of Tanks Blitz on Discord.

Commands
--------

The following are commands as of v2.3.3. An argument in `[braces]` is optional. An argument in `<arrows>` is required.

 * `@blitzbot help [command]` -- List all known commands or get help for a particular command.
 * `(direct message): help [command]` -- List all known commands or get help for a particular command.
 * `@blitzbot hi` -- Just saying hello.
 * `@blitzbot hello` -- Just saying hello.
 * `@blitzbot changes [version]` -- Get the update notes from the author (defaults to current version).
 * `@blitzbot version` -- Replies the current blitzbot version.
 * `@blitzbot add <screen name>` -- Associate your blitz screen name with discord.
 * `@blitzbot win-rate` -- Get the win rate of your account.
 * `@blitzbot tank-win-rate <tank-name>` -- Get your win rate on the given tank (replace spaces with dashes).
 * `@blitzbot mastery-list [level]` -- List tanks at the given mastery level, sorted by battle count (default: "Mastery").
 * `@blitzbot roster [clan-tag]` -- List a clan roster. Defaults to your clan if none specified.
 * `@blitzbot max-xp` -- Get your top 10 *max-xp* values.
 * `@blitzbot donate` -- Get a link to generously donate via paypal.

Installation Setup
------------------

Running your own instance probably isn't necessary unless you are forking this project. Follow these steps to get started.

 1. Install [node.js](https://nodejs.org), v12.x or newer.
 2. Get a WarGaming [application id](https://na.wargaming.net/developers/applications/).
 3. Create a Discord [api application](https://discordapp.com/developers/applications/me).
 4. Create a Discord user. Use a unique name, not "blitzbot" please.
 5. Decide which region is your default. One of "na", "eu", "ru", or "asia".
 6. Create a package that you can install by running `npm pack` in the repo root.
 7. Install the resulting package globally: `npm install -g blitzbot-3.5.0.tgz`.
 8. Create a file called "blitzbot.json" in the root of the install, in it store the values from steps 2-5.

     ```json
     {
       "app": {
         "secret": "-- discord application secret here --"
       },
       "user": {
         "token": "-- discord user token here --"
       },
       "wotblitz": {
         "default_region": "na",
         "key": "-- WarGaming application id here --"
       }
     }
     ```

Finally, start the bot by running the command `blitzbot` in your shell. It is suggested to run the code via a process monitor
like [forever](https://www.npmjs.com/package/forever), so when your bot crashes it will be silent to your audience.

Work in progress
----------------

*Everything* is a work in progress. Expect large and breaking changes at any point. In particular,
expect responses to become more streamlined, using more "natural" English.
