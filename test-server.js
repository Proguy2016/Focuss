/**
 * Simple test script to verify the collaboration server is running
 * Run with: node test-server.js
 */

import {get } from 'http';

console.log('Testing collaboration server connection...');

// Try to connect to the health endpoint
const req = get('http://localhost:4000/health', (res) => {
    console.log(`Server response status: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Server response:', data);
        console.log('\nSUCCESS: Collaboration server is running correctly!');
        console.log('You can now use the collaboration features in the app.');
    });
});

req.on('error', (error) => {
    console.error('\nERROR: Could not connect to collaboration server!');
    console.error(`Error details: ${error.message}`);
    console.error('\nPossible solutions:');
    console.error('1. Make sure the server is running with: npm run server');
    console.error('2. Check if port 4000 is available and not blocked by firewall');
    console.error('3. Try running start-collaboration.bat to start both frontend and server');
});

req.end();