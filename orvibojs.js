#!/usr/bin/env node
var dgram = require('dgram');
var socket = dgram.createSocket('udp4');
var program = require('commander');
program
  .version('0.0.1')
  .option('-s, --state [value]', 'Socket state - on/off')
  .option('-m, --mac [value]', 'Socket MAC address')
  .parse(process.argv);
var mac = program.mac;
var broadcastip = '255.255.255.255';
var port = 10000;
var macpadding = ['0x20', '0x20', '0x20', '0x20', '0x20', '0x20'];
var packet = [];
var state = program.state;
var maclittleendian = hex2ba(mac).slice().reverse();


socket.bind(port,function(){
  socket.setBroadcast(true);
  subscribe();
});

function subscribe(){
  packet = [];
  packet = packet.concat(['0x68', '0x64', '0x00', '0x1e', '0x63', '0x6c'], hex2ba(mac), macpadding, maclittleendian, macpadding);
  packet = new Buffer(packet);
  socket.send(packet, 0, packet.length, port, broadcastip, function(err, bytes) {
        if (err) throw err;
        switchSocket();
      });
}

function switchSocket(){
  packet = [];

  if(state == "on"){
    stateByte = '0x01';
  } else {
    stateByte = '0x00';
  }

  packet = packet.concat(['0x68', '0x64', '0x00', '0x17', '0x64', '0x63'], hex2ba(mac), macpadding, ['0x00', '0x00', '0x00', '0x00'], stateByte);
  packet = new Buffer(packet);
  socket.send(packet, 0, packet.length, port, broadcastip, function(err, bytes) {
        if (err) throw err;
        console.log(":)");
        socket.close();
      });

}

function hex2ba(hex) { // Takes a string of hex and turns it into a byte array: ['0xAC', '0xCF] etc.
    arr = []; // New array
	for (var i = 0; i < hex.length; i += 2) { // Loop through our string, jumping by 2 each time
	    arr.push("0x" + hex.substr(i, 2)); // Push 0x and the next two bytes onto the array
	}
	return arr;
}
