define([
  'socket.io'
], function (io) {
  
  var socket = io.connect('/rc'),
    successHandler = null,
    errorHandler = null;
  
  function connect(roomKey) {
    socket.emit('join-room', roomKey);
  }
  
  socket.on('room-joined', function (roomKey) {
    console.log('연결!', roomKey);
    successHandler && successHandler(roomKey);
  });
  
  socket.on('room-notexist', function (roomKey) {
    console.log('실패!', roomKey);
    errorHandler && errorHandler(roomKey);
  });
  
  function sendMovement(data) {
    socket.emit('send-movement', data); 
  }
  
  return {
    
    connect: function (roomKey, onsuccess, onerror) {
      successHandler = onsuccess;
      errorHandler = onerror;
      connect(roomKey);
    },
    
    sendMovement: function (data) {
      sendMovement(data);
    }
    
  };
  
});
