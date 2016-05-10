blitzbot [![Build Status](https://travis-ci.org/CodeMan99/blitzbot.svg?branch=master)](https://travis-ci.org/CodeMan99/blitzbot)
========

Statistics chat bot for World of Tanks Blitz on Discord.

Commands
--------

The following are commands of v1.2.4. An argument in `[braces]` is optional. An argument in `<arrows>` is required.

 * `@blitzbot help [command]` -- List all known commands or get help for a particular command.
 * `(direct message): help [command]` -- List all known commands or get help for a particular command.
 * `@blitz hi` -- Just saying hello.
 * `@blitz hello` -- Just saying hello.
 * `@blitzbot version` -- Replies the current blitzbot version.
 * `@blitzbot add <screen name>` -- Associate your blitz screen name with discord.
 * `@blitzbot win-rate` -- Get the win rate of your account.
 * `@blitzbot tank-win-rate <tank-name>` -- Get your win rate on the given tank (replace spaces with dashes).
 * `@blitzbot mastery-list [level]` -- List tanks at the given mastery level, sorted by battle count (default: "Mastery").
 * `@blitzbot roster [clan-tag]` -- List a clan roster. Defaults to your clan if none specified.

Work in progress
----------------

*Everything* is a work in progress. Expect large and breaking changes at any point. In particular,
expect responses to become more streamlined, using more "natural" English.
