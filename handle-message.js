//@ts-check
const MIN_PLAYERS = 4;
const HYPNOTISTS_PERCENT = 0.25;

const CREATE_COMMAND = "!s create";
const JOIN_COMMAND = "!s join";
const CANCEL_CREATE_COMMAND = "!s cancelCreate";
const START_COMMAND = "!s start";
const ROLE_COMMAND = "!s role";
const VOTE_COMMAND = "!s vote {playername}";
const VOTE_COMMAND_REGEXPR = /^!s vote (.+)$/ig;

let allPlayers = [];
let channel = null;
let gameStarter = null;

/**
 * HELPERS
 */

	/**
	 * from: https://stackoverflow.com/a/19270021
	 * @param {any[]} arr 
	 * @param {number} n 
	 * @returns {any[]}
	 */
	function getRandom(arr, n) {
		var result = new Array(n),
			len = arr.length,
			taken = new Array(len);
		if (n > len)
			throw new RangeError("getRandom: more elements taken than available");
		while (n--) {
			var x = Math.floor(Math.random() * len);
			result[n] = arr[x in taken ? taken[x] : x];
			taken[x] = --len;
		}
		return result;
	}

	async function getNickname(author) {
		const guildUser = await channel.guild.fetchMember(author);
		return guildUser.nickname || author.username;
	}
	
	async function getRole(message) {
		if(!channel) {
			message.channel.send(`There's no game started yet ! Start a game with the \`${CREATE_COMMAND}\` command.`);
			return;
		}
		if(!allPlayers.some(p => p === message.author)) {
			message.author.send(`Sorry, you aren't playing in the current game.`);
			return;
		}
		const isBadoozled = badoozledPlayers.some(p => p === message.author);
		const isHypnotist = hypnotists.some(p => p === message.author);
		message.author.send(`You are a ${isHypnotist ? "hypnotist" : "subject"}. You are ${isBadoozled ? "deep in trance" : "still sane"}.`);
	}

/**
 * GAME HANDLING
 */

	async function createGame(message) {
		if(channel !== null) {
			const authorNickname = await getNickname(gameStarter);
			channel.send(`There's already a game created by ${authorNickname}. Type \`${JOIN_COMMAND}\` to join the game ! (${allPlayers.length} player[s])`)
			return;
		}
		console.log("Creating game !");
		gameStarter = message.author;
		allPlayers = [];
		channel = message.channel;
		channel.send(`Game started. Type \`${JOIN_COMMAND}\` to join the game !`);
	}

	function cancelCreate(message) {
		channel.send(`Game cancelled. Type \`${CREATE_COMMAND}\` create a new game.`);
		channel = null;
		gameStarter = null;
		allPlayers = [];
		if(timer) {
			clearTimeout(timer);
			timer = null;
		}
	}

	async function join(message) {
		if(channel === null) {
			message.channel.send(`No game started. Start a game first with \`${CREATE_COMMAND}\`.`);
			return;
		}
		if(phase) {
			message.channel.send(`The game is in progress, <@${message.author.id}>. Wait for the next one :D`);
			return;
		}
		const nickname = await getNickname(message.author);
		if(allPlayers.some(p => p === message.author)) {
			channel.send(`You already joined, ${nickname}. ${allPlayers.length} player[s].`)
			return;
		}
		allPlayers.push(message.author);
		channel.send(`${nickname} joined the game (${allPlayers.length} player[s])`);
	}

/**
 * GAMEPLAY
 */

	let phase = null;
	let hypnotists = [];
	let recentlyBadoozled = [];
	let badoozledPlayers = [];
	let votes = {};
	async function startGame(message) {
		if(!channel) {
			message.channel.send(`No game started. Start a game first with \`${CREATE_COMMAND}\`.`);
			return;
		}
		if(message.author !== gameStarter) {
			const authorNickname = await getNickname(gameStarter);
			channel.send(`This game was created by ${authorNickname}. They should start the game, or you should use the \`${CANCEL_CREATE_COMMAND}\` command to cancel the game.`);		
			return;
		}
		if(allPlayers.length < MIN_PLAYERS) {
			channel.send(`There's currently less than ${MIN_PLAYERS} players in the game. Bring some more friends to play !`);
			return;
		}
		channel.send(`Starting the game...`)
		.then((message) => {
			const n = Math.ceil(allPlayers.length * HYPNOTISTS_PERCENT);
			hypnotists = getRandom(allPlayers, n);
			badoozledPlayers = [];
			message.delete(500);
			for(let tist of hypnotists) {
				tist.send(`The game has started ! you are a hypnotist, along with ${hypnotists.map(h => h.username).join(", ")}`)
			}
			channel.send(`${allPlayers.map(p => `<@${p.id}>`).join(" , ")} , the game has started ! There's ${n} hypnotists in the town of spirals.`,);
			handleNight();
		});
	}

	async function handleDay() {
		phase = "day";
		channel.send(`The sun is rising on the town of spirals.`);
		if(recentlyBadoozled.length) {
			channel.send(`Some more villagers have been enthralled tonight : ${recentlyBadoozled.map(p => `<@${p.id}>`).join(" , ")}`)
		}
		else {

			channel.send(`Surprisingly, nobody got enthralled tonight. Maybe the remaining hypnotists were too busy arguing between them.`)
		}
		recentlyBadoozled = [];
		votes = {};
		if(checkEnd())
			return;
		channel.send(`And now the villagers have to choose which of them to... pacify. (use \`${VOTE_COMMAND}\` to vote)`);
		timerA();
		console.log("Day time");
	}

	async function handleNight() {
		if(checkEnd())
			return;
		phase = "night";
		channel.send(`A new night falls on the town.`);
		recentlyBadoozled = [];	
		const aliveTists = hypnotists.filter(h => !badoozledPlayers.some(b => b === h));
		for(let tist of aliveTists) {
			tist.send(`The night has fallen. Vote for a new victim with \`${VOTE_COMMAND}\`.`)
		}
		votes = {};
		timerA();
		console.log("Night time");
	}
	
	async function handleVote(message, voteTarget) {
		if(channel === null) {
			message.channel.send(`There's no game started yet ! Start a game with the \`${CREATE_COMMAND}\` command.`);
			return;		
		}
		if(!allPlayers.some(p => p === message.author)) {
			message.author.send("You're not playing the game. Sorry.");
			return;		
		}
		if(phase === "night") {
			if(message.guild) {
				channel.send(`Don't vote here at night, but by DM !. I hope you like having your mind broken, though.`);
				return;
			}
			if(badoozledPlayers.some(p => p === message.author)) {
				message.author.send(`Sorry, but you're not able to think at all, let alone cast a vote.`);
				return;
			}
			if(!hypnotists.some(p => p === message.author)) {
				message.author.send(`You're not a hypnotist. You should be asleep at night !`);
				return;			
			}
			var targets = allPlayers.filter(p => !badoozledPlayers.some(b => b === p));
			if(!targets.some(p => p.username === voteTarget)) {
				message.author.send(`You can't vote for ${voteTarget}, they're not playing or already hypnotized. The available targets are : ${targets.map(t => t.username).join(", ")}`)
				return;
			}
			message.author.send(`You voted for ${voteTarget}.`)		
			votes[message.author] = voteTarget;
			checkAll();
			return;
		}
		if(phase === "day") {
			if(!message.guild) {
				message.author.send(`By day, all votes are public.`);
				return;
			}
			if(badoozledPlayers.some(p => p === message.author)) {
				channel.send(`Sorry <@${message.author.id}>, but you're not able to think at all, let alone cast a vote.`);
				return;
			}
			var targets = allPlayers.filter(p => !badoozledPlayers.some(b => b === p));
			if(!targets.some(p => p.username === voteTarget)) {
				channel.send(`You can't vote for ${voteTarget}, they're not playing or already hypnotized. The available targets are : ${targets.map(t => t.username).join(", ")}`)
				return;
			}
			votes[message.author] = voteTarget;
			channel.send(`<@${message.author.id}> voted for ${voteTarget} !`);
			checkAll();
			return;		
		}
	}

/**
 * GAMEPLAY - CHECKS
 */
let timer;
	function timerA() {
		channel.send("Two minutes remaining !");
		timer = setTimeout(() => {
			timerB();
		}, 90000);
	}

	function timerB() {
		channel.send("30s remaining !");
		timer = setTimeout(() => {
			checkAll(true);
			timer = null;
		}, 30000);
	}

	function checkEnd() {
		const alivePlayers = allPlayers.filter(p => !badoozledPlayers.some(b => b === p));
		const aliveTists = hypnotists.filter(p => !badoozledPlayers.some(b => b === p));
		if(alivePlayers.length === aliveTists.length) {
			channel.send(allPlayers.map(p => `<@${p.id}>`).join(", "));
			channel.send(`The hypnotists were : ${hypnotists.map(p => `<@${p.id}>`).join(", ")}`);
			channel.send(`The game has ended, and the town has fallen to the hypnotists.`);
			channel = null;
			phase = null;		
			return true;
		}
		if(aliveTists.length === 0) {
			channel.send(allPlayers.map(p => `<@${p.id}>`).join(", "));
			channel.send(`The hypnotists were : ${hypnotists.map(p => `<@${p.id}>`).join(", ")}`);
			channel.send(`The game has ended, and the town is safe from the hypnotists.`);
			channel = null;
			phase = null;
			return true;
		}
		return false;
	}

	function checkAll(forceEnd) {
		forceEnd = forceEnd || false;
		if(phase === "day") {
			const voters = allPlayers.filter(p => !badoozledPlayers.some(b => b === p));
			const remaining = voters.filter(t => !votes[t]);
			console.log("Remaining votes : " + remaining.length);
			if(!forceEnd) {
				if(remaining.length > 0) {
					channel.send(`There's still ${remaining.length} people who have to vote.`);
					return;
				}
			}
			if(timer) {
				clearTimeout(timer);
				timer = null;
			}
			channel.send(`Everybody has voted ! Here's the result.`);
			/** @type {[any, number][]} */
			const results = [];
			for(let value in votes) {
				const target = votes[value];
				const targetPlayer = allPlayers.filter(p => p.username === target)[0];
				const targetValues = results.filter(v => v[0] === targetPlayer);
				if(targetValues.length > 0)
					targetValues[0][1] += 1;
				else
					results.push([targetPlayer, 1]);
			}
			results.sort(function(a, b) {
				return b[1] - a[1];
			});
			if(results.length > 1) {
				if(results[0][1] === results[1][1]) {
					channel.send("This was a tie and nobody got mindbroken today.");
					handleNight();
					return;
				}
				const target = results[0][0];
				channel.send(`<@${target.id}> has been chosen as the victim.`);
				channel.send(`The town gather as <@${target.id}> is brought to the chair.`);
				channel.send(`The chair begins its magic, and <@${target.id}> slowly feels their mind sleeping away.`);
				channel.send(`After a while, they're let free to wander around, not able to think anymore.`);
				badoozledPlayers.push(target);
				handleNight();
				return;
			}
			const target = results[0][0];
			channel.send(`<@${target.id}> has been chosen as the victim.`);		
			channel.send(`The town gather as <@${target.id}> is brought to the chair.`);
			channel.send(`The chair begins its magic, and <@${target.id}> slowly feels their mind sleeping away.`);
			channel.send(`After a while, they're let free to wander around, not able to think anymore.`);
			badoozledPlayers.push(target);
			handleNight();
			return;
		}
		if(phase === "night") {
			const voters = hypnotists.filter(p => !badoozledPlayers.some(b => b === p));
			const remaining = voters.filter(t => !votes[t]);
			console.log("Remaining votes : " + remaining.length);
			if(!forceEnd) {
				if(remaining.length > 0) {
					let currentVotes = [];
					for(let vote in votes) {
						currentVotes.push(votes[vote]);
					}
					for(let tist of hypnotists)
						tist.send(`There's still ${remaining.length} people who have to vote. Current votes : ${currentVotes.join(", ")}.`);
					return;
				}
			}
			if(timer) {
				clearTimeout(timer);
				timer = null;
			}
			for(let tist of hypnotists)
				tist.send(`Everybody has voted ! Here's the result.`);
			/** @type {[any, number][]} */
			const results = [];
			for(let value in votes) {
				const target = votes[value];
				const targetPlayer = allPlayers.filter(p => p.username === target)[0];
				const targetValues = results.filter(v => v[0] === targetPlayer);
				if(targetValues.length > 0)
					targetValues[0][1] += 1;
				else
					results.push([targetPlayer, 1]);
			}
			results.sort(function(a, b) {
				return b[1] - a[1];
			});
			if(results.length > 1) {
				if(results[0][1] === results[1][1]) {
					for(let tist of hypnotists)
						tist.send("The vote is closed. This was a tie and nobody got mindbroken today.");
					handleDay();
					return;
				}
				const target = results[0][0];
				for(let tist of hypnotists)
					tist.send(`You sneak to <@${target.id}>'s house, where you find your fellow tists. With their help, you break <@${target.id}>'s mind.`);
				badoozledPlayers.push(target);
				recentlyBadoozled.push(target);
				handleDay();
				return;
			}
			const target = results[0][0];
			for(let tist of hypnotists)
				tist.send(`You sneak to <@${target.id}>'s house, where you find your fellow tists. With their help, you break <@${target.id}>'s mind.`);
			badoozledPlayers.push(target);
			recentlyBadoozled.push(target);
			handleDay();
			return;
		}
	}

const test = "X has been voted guilty by the town, and is now Broken. Not that they're complaining anymore.";
const test2 = "You got brainwashed! Your mind now belongs to another!";
const test3 = "Someone got brainwashed! Another pet is now up for adoption~!";
const test4 = "Someone got brainwashed! hohoho~ a new slave has joined the workforce!";
const test5 = "The day begins anew, but can the same be said for the people~";
const test6 = "Someone got brainwashed! They are  now  a happy little doll~";
const test7 = "Oh the night has fallen~ and the brainwashing begins~";

function handleMessage(message) {
	switch(message.content) {
		case "!s help":
			return;
		case CREATE_COMMAND:
			createGame(message);
			join(message);
			return;
		case CANCEL_CREATE_COMMAND: 
			cancelCreate(message);
			return;
		case JOIN_COMMAND:
			join(message);
			return;
		case START_COMMAND:
			startGame(message);
			return;
		case ROLE_COMMAND:
			getRole(message);
			return;
		default:
			break;
	}
	const voteData = VOTE_COMMAND_REGEXPR.exec(message.content);
	if(voteData) {
		let voteTarget = voteData[1];
		if(message.mentions.users && message.mentions.users[0]) {
			voteTarget = message.mentions.users[0].username;
		}
		handleVote(message, voteTarget);
	}
}

module.exports = handleMessage;