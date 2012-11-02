
var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server);



// HTTP 설정
//----------

// 80 포트 사용
server.listen(80);

// 스태틱 파일 설정
app.use('/static', express.static(__dirname + '/static'));

// 컨트롤러 페이지 설정
app.get('/ctrl', function (req, res) {
  res.sendfile(__dirname + '/client/ctrl.html');
});

// 예제 페이지 설정
app.get('/example', function (req, res) {
  res.sendfile(__dirname + '/client/example.html');
});



// 소켓 설정
//----------

// 소켓 통신으로 native websocket만 사용한다.
io.configure(function () {
  io.set('transports', ['websocket']);
});




// 메인 코드
//----------
var rooms = [];

io.of('/rc').on('connection', function (s) {
  
  // 방 만들기 요청
  s.on('create-room', function () {
    
    var roomKey = String(parseInt(Math.random() * 1000));
    
    // 방 코드를 생성해 소켓 데이터에 할당한다.
    s.roomKey = roomKey;
    
    // 방을 생성하고,
    s.join(roomKey);
    
    // 생성한 방을 저장하고
    rooms.push(roomKey);
    
    // 완성 메시지를 보낸다.
    s.emit('room-created', roomKey);

  });
  
  // 방 입장 요청
  s.on('join-room', function (roomKey) {
    
    if (rooms.indexOf(roomKey) === -1) {
      // 존재하지 않는 경우
      s.emit('room-notexist', roomKey); 
      return;
    }
    
    s.roomKey = roomKey;
    s.join(roomKey);
    s.emit('room-joined', roomKey);
    
  });
  
  // 컨트롤러의 메시지 요청
  s.on('send-movement', function (data) {
    
    if (s.roomKey) {
      s.broadcast.to(s.roomKey).emit('move', data);    
    }
    
  });
  
});



