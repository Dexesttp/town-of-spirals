# Town of Spirals

A Discord.JS bot to play a Town of Salem / Mafia / Werewolves (but hypno-themed) game.

## Install the bot

It's fairly easy. You'll just need git [(see here for how)]() and node.js 7.0 or greater [(available here)]().

Open a terminal at the location of your choice.

Run the commands :

`git clone https://github.com/Dexesttp/town-of-spirals.git`

`cd town-of-spirals`

`npm i`

`tsc`

Create the file `config.json` in the current folder, it should look like that :

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

## License

This project is MIT.
