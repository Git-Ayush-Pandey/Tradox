// const socket = new WebSocket('wss://ws.finnhub.io?token=d1qt5g1r01qo4qd9aiegd1qt5g1r01qo4qd9aif0');

// // Connection opened -> Subscribe
// socket.addEventListener('open', function (event) {
//     socket.send(JSON.stringify({'type':'subscribe', 'symbol': 'AAPL'}))
// });

// // Listen for messages
// socket.addEventListener('message', function (event) {
//     console.log('Message from server ', event.data);
// });

// // Unsubscribe
//  var unsubscribe = function(symbol) {
//     socket.send(JSON.stringify({'type':'unsubscribe','symbol': symbol}))

const istNow = new Date(
  new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
);
console.log("🕐 IST Time:", istNow.toString());  // Add this line
