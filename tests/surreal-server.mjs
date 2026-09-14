// Test runner for the @ascua/surreal integration suite.
//
// Boots an in-memory SurrealDB 3.x server, applies the fixture schema, runs
// `ember test` (forwarding any extra CLI args, e.g. --filter / --launch),
// and tears the server down afterwards.
//
//   node tests/surreal-server.mjs --filter surreal
//
// Requires the `surreal` CLI (3.x) on PATH.

import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Buffer } from 'node:buffer';
import { createServer } from 'node:net';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOST = '127.0.0.1';
const NS = 'test';
const DB = 'test';
const AUTH = 'Basic ' + Buffer.from('root:root').toString('base64');

// Resolved in main(), once a free port has been found.
let PORT;
let ENDPOINT;

// Does anything already hold this port?
//
// This matters more than it looks. The suite talks to whatever answers on the
// port, and `waitForHealth` cannot tell the server this runner spawned from
// one that was already running - so a developer with a SurrealDB instance up
// on the default port (the usual local-development setup) previously had the
// fixture schema applied to THAT server, and every `reset` table in
// `setupSurreal` DELETEd there, against a real on-disk database. The default
// port is therefore no longer 8000, and a port that is already taken is a
// hard error rather than something to connect to.

function free(port) {
	return new Promise((resolve) => {
		const probe = createServer();
		probe.once('error', () => resolve(false));
		probe.once('listening', () => probe.close(() => resolve(true)));
		probe.listen(port, HOST);
	});
}

async function choosePort() {
	if (process.env.SURREAL_PORT) {
		const port = Number(process.env.SURREAL_PORT);
		if (!(await free(port))) {
			throw new Error(
				`SURREAL_PORT=${port} is already in use. The test suite applies its fixture ` +
				`schema and DELETEs its fixture tables on the server it connects to, so it ` +
				`refuses to share a port with an already-running SurrealDB. Stop that server ` +
				`or pick another port.`,
			);
		}
		return port;
	}
	for (let port = 8100; port < 8200; port++) {
		if (await free(port)) return port;
	}
	throw new Error('No free port found in the range 8100-8199 for the test server');
}

let surreal;

function shutdown(code) {
	if (surreal && !surreal.killed) {
		try { surreal.kill('SIGTERM'); } catch (e) { /* ignore */ }
	}
	process.exit(code);
}
process.on('SIGINT', () => shutdown(130));
process.on('SIGTERM', () => shutdown(143));

async function waitForHealth(timeoutMs = 30000) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		try {
			const res = await fetch(`${ENDPOINT}/health`);
			if (res.ok) return;
		} catch (e) { /* not up yet */ }
		await new Promise((r) => setTimeout(r, 250));
	}
	throw new Error(`SurrealDB did not become healthy within ${timeoutMs}ms`);
}

async function applySchema() {
	const schema = readFileSync(join(__dirname, 'fixtures', 'schema.surql'), 'utf8');
	const res = await fetch(`${ENDPOINT}/sql`, {
		method: 'POST',
		headers: {
			Authorization: AUTH,
			'surreal-ns': NS,
			'surreal-db': DB,
			Accept: 'application/json',
		},
		body: schema,
	});
	const out = await res.json();
	const errors = Array.isArray(out) ? out.filter((r) => r.status !== 'OK') : [out];
	if (!res.ok || errors.length) {
		throw new Error('Schema apply failed: ' + JSON.stringify(errors).slice(0, 500));
	}
}

async function main() {
	PORT = await choosePort();
	ENDPOINT = `http://${HOST}:${PORT}`;

	console.log('• starting SurrealDB on ' + ENDPOINT);
	surreal = spawn(
		'surreal',
		['start', '--user', 'root', '--pass', 'root', '--bind', `${HOST}:${PORT}`, 'memory'],
		{ stdio: 'ignore' },
	);
	surreal.on('error', (e) => {
		console.error('Failed to start surreal (is the 3.x CLI on PATH?):', e.message);
		process.exit(1);
	});

	await waitForHealth();
	console.log('• applying fixture schema to ' + NS + '/' + DB);
	await applySchema();

	console.log('• running ember test');
	const ember = spawn('npx', ['ember', 'test', ...process.argv.slice(2)], {
		stdio: 'inherit',
		// SURREAL_TESTS un-gates the integration modules, and SURREAL_PORT
		// tells the built app which port this run's server is on (see
		// config/environment.js - both are read at build time).
		env: { ...process.env, SURREAL_TESTS: '1', SURREAL_PORT: String(PORT) },
	});
	ember.on('exit', (code) => shutdown(code === null ? 1 : code));
}

main().catch((e) => {
	console.error(e.message || e);
	shutdown(1);
});
