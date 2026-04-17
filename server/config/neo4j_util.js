const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(
    process.env.NEO4J_URI || 'bolt://localhost:7687',
    neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD || 'shiva'
    )
);

function getNeoSession() {
    return driver.session();
}

async function closeNeoConnection() {
    await driver.close();
}

module.exports = {
    getNeoSession,
    closeNeoConnection
};
