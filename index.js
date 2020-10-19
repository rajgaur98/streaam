const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');

// const ExpressPeerServer = require('peer').ExpressPeerServer;
// const peerServer = ExpressPeerServer(server, {
//   debug: true
// });

// // server.listen(3000, () =>{
// // 	console.log("Serving port 3000");
// // });

// app.use('/peerjs', peerServer); //peerjs server living in express and runing at different ports

app.set('view engine', 'ejs');
app.use(express.static('public'));


app.get('/', (req, res) =>{
	res.redirect(`/${uuidV4()}`);  //send uuid to client address bar 
 })

app.get('/:room', (req, res) =>{
	let addRoomId = req.params.room;
    console.log(addRoomId);
	res.render('room',{roomId: `${addRoomId}` }); //get id from address bar and send to ejs
})

io.on('connection', socket =>{
	//code to disconnect user using socket simple method ('join-room')
	socket.on('join-room',(roomId, userId) =>{
		
		console.log("room Id:- " + roomId,"userId:- "+ userId);    //userId mean new user 
		socket.join(roomId);                                       //join this new user to room
		socket.to(roomId).broadcast.emit('user-connected',userId); //for that we use this and emit to cliet	
		
		//code to massage in roomId
		socket.on('message', message =>{
			io.to(roomId).emit('createMessage',message,userId);
			
		})
	    socket.on('disconnect', () =>{
	    	socket.to(roomId).broadcast.emit('user-disconnected', userId)
	    	socket.to(roomId).broadcast.emit('user-screencast-disconnected', userId)
	    })   
        socket.on('myScreenShareEvent', function (data) {
        	console.log(data);
            socket.to(roomId).broadcast.emit('user-connected',data);
         });
	})
	
})

server.listen(3000, () =>{
	console.log("Serving port 3000")
});