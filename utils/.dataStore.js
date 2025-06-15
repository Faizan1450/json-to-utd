// dataStore.js

export let rows = []; // Will hold all data
export let byIdd = new Map();           // Map<string, Row>
export let byInterface = new Map();     // Map<string, Row[]>
export let byIflow = new Map();   // Map<string, Row[]>
export let version = 0;             // increments on every reload