# Town of Spirals

A Discord.JS bot to play a Town of Salem / Mafia / Werewolves (but hypno-themed) game.

## Install the bot

It's fairly easy. You'll just need git and node.js v16.6.0 or higher

Important: Node.js v16.6.0 is REQUIRED for discord.js (otherwise you'll get an error about AbortController)

Open a terminal at the location of your choice.

Run the commands :

`git clone https://github.com/Dexesttp/town-of-spirals.git`

`cd town-of-spirals`

`npm i`

`npm run build`

Create the file `config.json` in the current folder (base it on the `config.default.json` file), and fill it up with the required info:

```json
{
	"token": "Your token (under APP BOT USER / token)"
}
```

To start the bot, run  
`npm start`  
or  
`node build/ts/index.js`

Voilà ! The bot is setup !

## Commands

The main one is help (`!s help`). You'll learn everything from that.

## Local debug

To start debugging with the REPL, run  
`npm run debug`  
or  
`node build/ts/debug.js`

Note : you can emulate people by typing `1>!s <command>` for channel or `1p>!s <command>` for direct messages

Note (2): If you want to skip having to type `npm run build` after each command, you can use `npm run watch-build` to have a watching compiler running on your code.

## License

This project is MIT.
