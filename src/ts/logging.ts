import * as moment from "moment";

export default {
  channel(name: string | null, message: string) {
    if (name === null) {
      console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message}`);
      return;
    }
    console.log(
      `[${moment().format("YYYY-MM-DD HH:mm:ss")}] [#${name}] ${message}`
    );
  },
  basic(message: string) {
    console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message}`);
  },
};
