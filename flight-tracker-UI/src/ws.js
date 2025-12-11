export function createWS(url, onMessage) {
const ws = new WebSocket(url);


ws.addEventListener('open', () => {
console.log('WS open');
});


ws.addEventListener('message', (ev) => {
try {
const obj = JSON.parse(ev.data);
onMessage(obj);
} catch (e) {
console.warn('invalid ws message', e);
}
});


ws.addEventListener('close', () => console.log('WS closed'));
ws.addEventListener('error', (e) => console.error('WS error', e));


return ws;
}