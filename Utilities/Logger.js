import chalk from 'chalk';
export class Logger {
	constructor() {}

	static info(message, prefix = null) {
		if (prefix == null) return console.log(`${chalk.cyan('[i]')} ${message}`);
		return console.log(`${chalk.cyan(`[i | ${prefix}]`)} : ${message}`);
	}

	static warn(message, prefix) {
		if (prefix == null) return console.log(`${chalk.yellow('[!]')} ${message}`);
		return console.log(`${chalk.yellow(`[! | ${prefix}]`)} : ${message}`);
	}

	static error(message, prefix) {
		if (prefix == null) return console.log(`${chalk.red('[-]')} ${message}`);
		return console.log(`${chalk.red(`[- | ${prefix}]`)} : ${message}`);
	}

	static success(message, prefix) {
		if (prefix == null) return console.log(`${chalk.green('[+]')} ${message}`);
		return console.log(`${chalk.green(`[+ | ${prefix}]`)} : ${message}`);
	}

	static severe(message, prefix) {
		if (prefix == null) return console.log(`${chalk.bgRed('[>]')} ${message}`);
		return console.log(`${chalk.bgRed.white(`[> | ${prefix}]`)} : ${message}`);
	}
}