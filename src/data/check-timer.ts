import { gameConfig } from "./game-config";
import { checkAll } from "./check-all";

let timer: NodeJS.Timer | null = null;
export function timerA() {
	if(!gameConfig.channel)
		return;
	gameConfig.channel.send("Five minutes remaining !");
	timer = setTimeout(() => {
		timerB();
	}, 270000);
}

export function timerB() {
	if(!gameConfig.channel)
		return;
	gameConfig.channel.send("30s remaining !");
	timer = setTimeout(() => {
		checkAll(true);
		timer = null;
	}, 30000);
}

export function clearTimer() {
	if(timer) {
		clearTimeout(timer);
		timer = null;
	}
}