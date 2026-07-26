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

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOST = '127.0.0.1';
const PORT = process.env.SURREAL_PORT ? Number(process.env.SURREAL_PORT) : 8000;
const ENDPOINT = `http://${HOST}:${PORT}`;
const NS = 'test';
const DB = 'test';
const AUTH = 'Basic ' + Buffer.from('root:root').toString('base64');

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
		// SURREAL_TESTS un-gates the integration modules (see config/environment.js)
		env: { ...process.env, SURREAL_TESTS: '1' },
	});
	ember.on('exit', (code) => shutdown(code === null ? 1 : code));
}

main().catch((e) => {
	console.error(e.message || e);
	shutdown(1);
});
