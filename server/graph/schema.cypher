// ===============================================
// 1. SCHEMA DEFINITION (CONSTRAINTS & INDEXES)
// ===============================================

// Ensure unique IDs for all core entities to prevent duplication during MERGE
CREATE CONSTRAINT IF NOT EXISTS FOR (v:Vehicle) REQUIRE v.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (o:Owner) REQUIRE o.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (sc:ServiceCenter) REQUIRE sc.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (sr:ServiceRecord) REQUIRE sr.id IS UNIQUE;

// Indexes for performance on frequently queried attributes
CREATE INDEX IF NOT EXISTS FOR (v:Vehicle) ON (v.model);
CREATE INDEX IF NOT EXISTS FOR (sr:ServiceRecord) ON (sr.date);
CREATE INDEX IF NOT EXISTS FOR (sr:ServiceRecord) ON (sr.km);
