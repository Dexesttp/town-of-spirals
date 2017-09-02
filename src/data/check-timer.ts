import { sendChannelMessage } from "./game-config";
import { checkAll } from "./check-all";

let timer;
export function timerA() {
	sendChannelMessage("Two minutes remaining !");
	timer = setTimeout(() => {
		timerB();
	}, 90000);
}

export function timerB() {
	sendChannelMessage("30s remaining !");
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