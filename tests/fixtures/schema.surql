-- Schema for the @ascua/surreal integration-test fixtures (author / book).
-- Applied to ns/db `test`/`test` by tests/surreal-server.mjs before the run.
-- Mirrors the field types used by app/models/{author,book,detail}.js.

-- --------------------------------------------------
-- ANALYZER (for full-text search tests)
-- --------------------------------------------------

DEFINE ANALYZER search TOKENIZERS blank,class,camel FILTERS lowercase,ascii,edgengram(2,15);

-- --------------------------------------------------
-- TABLE author
-- --------------------------------------------------

DEFINE TABLE author SCHEMAFULL;

DEFINE FIELD name ON author TYPE option<string>;
DEFINE FIELD created ON author TYPE option<datetime>;
DEFINE FIELD tags ON author TYPE option<array<string>>;

DEFINE INDEX author_name ON author FIELDS name FULLTEXT ANALYZER search BM25;

-- --------------------------------------------------
-- TABLE book
-- --------------------------------------------------

DEFINE TABLE book SCHEMAFULL;

DEFINE FIELD title ON book TYPE option<string>;
DEFINE FIELD published ON book TYPE option<datetime>;
DEFINE FIELD author ON book TYPE option<record<author>>;
DEFINE FIELD contributors ON book TYPE option<array<record<author>>>;
DEFINE FIELD detail ON book TYPE option<object>;
DEFINE FIELD detail.isbn ON book TYPE option<string>;
DEFINE FIELD detail.pages ON book TYPE option<number>;

DEFINE FIELD details ON book TYPE option<array<object>>;
DEFINE FIELD details.*.isbn ON book TYPE option<string>;
DEFINE FIELD details.*.pages ON book TYPE option<number>;

-- --------------------------------------------------
-- TABLE gadget
-- --------------------------------------------------

DEFINE TABLE gadget SCHEMAFULL;

DEFINE FIELD name ON gadget TYPE option<string>;
DEFINE FIELD parts ON gadget TYPE option<array<object>>;
DEFINE FIELD parts.*.isbn ON gadget TYPE option<string>;
DEFINE FIELD parts.*.pages ON gadget TYPE option<number>;

DEFINE INDEX book_title ON book FIELDS title FULLTEXT ANALYZER search BM25;

-- --------------------------------------------------
-- TABLE widget + `restricted` record access
-- --------------------------------------------------
--
-- Exists purely to reproduce a delete denied by table PERMISSIONS: a plain
-- `DEFINE USER ... ROLES EDITOR/VIEWER` bypasses table PERMISSIONS entirely
-- (verified directly - only a record-access session is filtered by them),
-- so a genuine repro needs one, and `restricted` is the minimal shape of one
-- - a single fixed identity, signed into passwordlessly, with no fields or
-- variables to manage. `widget`'s `FOR delete WHERE false` denies every
-- delete under that access unconditionally, on purpose, as the simplest
-- possible always-false permission.

DEFINE TABLE restricted_owner SCHEMAFULL PERMISSIONS FULL;
DEFINE FIELD name ON restricted_owner TYPE option<string>;

CREATE restricted_owner:only SET name = 'only';

DEFINE ACCESS restricted ON DATABASE TYPE RECORD
	SIGNIN ( SELECT * FROM ONLY restricted_owner:only )
	DURATION FOR SESSION 1h;

DEFINE TABLE widget SCHEMAFULL
	PERMISSIONS
		FOR select, create, update FULL
		FOR delete WHERE false;

DEFINE FIELD name ON widget TYPE option<string>;

-- --------------------------------------------------
-- TABLE gizmo
-- --------------------------------------------------
--
-- The `@autosave` fixture used by the nested-object, nested-array,
-- record-link and live-query suites. Deliberately richer than `gadget`:
-- it mirrors the shapes that app.hireinsight.io's `contact` actually uses —
-- an embedded object that itself contains an array and a further embedded
-- object (`contact.location`), an array of embedded objects each with their
-- own array and nested object (`contact.fields`, `contact.emails`), a single
-- record link (`contact.account`) and an array of record links
-- (`contact.owners`, `contact.applications`).

DEFINE TABLE gizmo SCHEMAFULL;

DEFINE FIELD name ON gizmo TYPE option<string>;

DEFINE FIELD owner ON gizmo TYPE option<record<author>>;
DEFINE FIELD owners ON gizmo TYPE option<array<record<author>>>;

DEFINE FIELD spec ON gizmo TYPE option<object>;
DEFINE FIELD spec.code ON gizmo TYPE option<string>;
DEFINE FIELD spec.tags ON gizmo TYPE option<array<string>>;
DEFINE FIELD spec.note ON gizmo TYPE option<object>;
DEFINE FIELD spec.note.text ON gizmo TYPE option<string>;

DEFINE FIELD specs ON gizmo TYPE option<array<object>>;
DEFINE FIELD specs.*.code ON gizmo TYPE option<string>;
DEFINE FIELD specs.*.tags ON gizmo TYPE option<array<string>>;
DEFINE FIELD specs.*.note ON gizmo TYPE option<object>;
DEFINE FIELD specs.*.note.text ON gizmo TYPE option<string>;

-- --------------------------------------------------
-- TABLE doodad
-- --------------------------------------------------
--
-- Type-coverage fixture: every field kind the connector supports, each as a
-- bare value, inside an array, and inside an embedded object — so a type can
-- be exercised on its own and in every position it can actually occupy.

DEFINE TABLE doodad SCHEMAFULL;

DEFINE FIELD text ON doodad TYPE option<string>;
DEFINE FIELD count ON doodad TYPE option<number>;
DEFINE FIELD flag ON doodad TYPE option<bool>;
DEFINE FIELD when ON doodad TYPE option<datetime>;
DEFINE FIELD blob ON doodad TYPE option<object> FLEXIBLE;
DEFINE FIELD blobs ON doodad TYPE option<array>;

DEFINE FIELD texts ON doodad TYPE option<array<string>>;
DEFINE FIELD counts ON doodad TYPE option<array<number>>;
DEFINE FIELD flags ON doodad TYPE option<array<bool>>;
DEFINE FIELD whens ON doodad TYPE option<array<datetime>>;

DEFINE FIELD link ON doodad TYPE option<record<author>>;
DEFINE FIELD links ON doodad TYPE option<array<record<author>>>;

DEFINE FIELD bits ON doodad TYPE option<object>;
DEFINE FIELD bits.text ON doodad TYPE option<string>;
DEFINE FIELD bits.count ON doodad TYPE option<number>;
DEFINE FIELD bits.flag ON doodad TYPE option<bool>;
DEFINE FIELD bits.when ON doodad TYPE option<datetime>;
DEFINE FIELD bits.texts ON doodad TYPE option<array<string>>;
DEFINE FIELD bits.counts ON doodad TYPE option<array<number>>;

DEFINE FIELD bitses ON doodad TYPE option<array<object>>;
DEFINE FIELD bitses.*.text ON doodad TYPE option<string>;
DEFINE FIELD bitses.*.count ON doodad TYPE option<number>;
DEFINE FIELD bitses.*.flag ON doodad TYPE option<bool>;
DEFINE FIELD bitses.*.when ON doodad TYPE option<datetime>;
DEFINE FIELD bitses.*.texts ON doodad TYPE option<array<string>>;
DEFINE FIELD bitses.*.counts ON doodad TYPE option<array<number>>;

-- --------------------------------------------------
-- TABLE gremlin
-- --------------------------------------------------
--
-- A table the server will genuinely refuse writes to, so the rollback and
-- error-reporting paths can be exercised against a real rejection rather
-- than a simulated one. `name` accepts at most five characters; anything
-- longer fails the ASSERT and the whole UPDATE is rejected.

DEFINE TABLE gremlin SCHEMAFULL;

DEFINE FIELD name ON gremlin TYPE option<string>
	ASSERT $value = NONE OR string::len($value) <= 5;

DEFINE FIELD note ON gremlin TYPE option<string>;

-- --------------------------------------------------
-- TABLE beacon + blip (retry fixture)
-- --------------------------------------------------
--
-- Reproduces a genuine "Transaction conflict" rather than a simulated one:
-- `blip`'s CREATE event sleeps briefly before bumping a single shared
-- `beacon` record, widening the window for concurrent CREATEs to race for
-- that same row - the same shape as app.hireinsight.io's `notify` events,
-- several of which can land on one contact from a single LinkedIn import.

DEFINE TABLE beacon SCHEMAFULL;

DEFINE FIELD hits ON beacon TYPE number DEFAULT 0;

DEFINE TABLE blip SCHEMAFULL;

DEFINE FIELD beacon ON blip TYPE record<beacon>;

DEFINE EVENT notify ON blip WHEN $event = "CREATE" THEN {
	SLEEP 15ms;
	UPDATE $after.beacon SET hits += 1;
};

-- Same shape as blip, but for an UPDATE/UPSERT conflict rather than a CREATE
-- one: `stamp:shared` is a single fixed record every worker updates
-- concurrently, so the update itself - not a fresh row each time - is what
-- collides. `seq` exists only so each write's payload genuinely changes the
-- record; SurrealDB does not fire an UPDATE event for a merge that would
-- leave every field's value the same as it already was.

DEFINE TABLE stamp SCHEMAFULL;

DEFINE FIELD beacon ON stamp TYPE record<beacon>;
DEFINE FIELD seq ON stamp TYPE option<number>;

DEFINE EVENT notify ON stamp WHEN $event = "UPDATE" THEN {
	SLEEP 15ms;
	UPDATE $after.beacon SET hits += 1;
};

-- --------------------------------------------------
-- TABLE ledger (.content() vs .replace() fixture)
-- --------------------------------------------------
--
-- `opened` is READONLY, matching SurrealDB's own docs example for the one
-- documented behavioural difference between CONTENT and REPLACE: a CONTENT
-- payload that omits a READONLY field silently keeps its stored value,
-- while the identical REPLACE payload raises an error.

DEFINE TABLE ledger SCHEMAFULL;

DEFINE FIELD opened ON ledger TYPE datetime READONLY;
DEFINE FIELD balance ON ledger TYPE number DEFAULT 0;

-- --------------------------------------------------
-- TABLE follows (relate() fixture)
-- --------------------------------------------------
--
-- A minimal graph-edge table between two `author` records, for exercising
-- `relate()`/`store.relate()` both directly and inside a transaction.

DEFINE TABLE follows SCHEMAFULL TYPE RELATION IN author OUT author;

-- The ASSERT gives `relate()` its own genuine-rejection fixture, matching
-- `gremlin`'s role for `modify()`/`update()`.
DEFINE FIELD since ON follows TYPE option<datetime>
	ASSERT $value = NONE OR $value > d'2000-01-01T00:00:00Z';
