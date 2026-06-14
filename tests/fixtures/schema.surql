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

DEFINE INDEX book_title ON book FIELDS title FULLTEXT ANALYZER search BM25;
