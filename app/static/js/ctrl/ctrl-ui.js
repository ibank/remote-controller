define([
  'jquery',
  'raphael',
  'ctrl/socket-connector'
], function ($, R, sc) {
  
  var paper,
    w, // 조이스틱 가로
    h, // 조이스틱 세로
    ctrl, // 컨트롤러
    
  
    timer = null, // 타이머
    sendX, // 보낼 x
    sendY, // 보낼 y
    btnA, // 버튼A
    btnB, // 버튼B
    
    THRESHOLD = 100;
 
 
  function init() {
    w = $('#ctrl').width();
    h = 280;
    
    paper = R('ctrl', w, h);
    
    draw();
  }
  
  function draw() {
    drawBackground();
    drawCtrl();
    bindButtonEvent();
    bindCircleEvent();
  }
  
  function drawBackground() {
    // 버튼 래퍼
    paper.circle(w/2, h/2, 40).attr({
      'stroke': '#666',
      'stroke-width': 1,
      'fill': '#eee'
    });
    
    // 영역 래퍼
    paper.circle(w/2, h/2, 105).attr({
      'stroke': '#999',
      'stroke-width': 1
    });
  }
  
  function drawCtrl() {
    ctrl = paper.circle(w/2, h/2, 35).attr({
      'stroke': '#999',
      'stroke-width': 1,
      'fill': 'gray'
    }); 
  }

  function bindButtonEvent() {
    $('#btn-a').on('touchstart', function () {
      sc.sendMovement([0, 0, 0, 0, 1, 0]);
    }); 
    
    $('#btn-b').on('touchstart', function () {
      sc.sendMovement([0, 0, 0, 0, 0, 1]);
    });
  }

  function bindCircleEvent() {
    var ox, oy;
    
    ctrl
      .drag(
        // 드래그 중일 때
        function (dx, dy, x, y, e) {
          var pow = Math.pow,
            sqrt = Math.sqrt,
          
            r1 = pow(THRESHOLD, 2), // 제한하는 반지름
            r2 = pow(dx, 2) + pow(dy, 2); // 실제 원에서의 거리
          
          if (r2 > r1) {
            dy = THRESHOLD * dy / sqrt(r2);
            dx = THRESHOLD * dx / sqrt(r2);
          }
          
          this.attr({
            cx: ox + dx,
            cy: oy + dy,
            fill: 'orange'
          });
          
          setMovement(dx, dy);
        
        // 드래그 시작할 때
        }, function (x, y, e) {
          ox = this.attr('cx');
          oy = this.attr('cy');
          
          // 타이머 등록
          sendMovement();
        
        // 드래그 종료했을 때  
        }, function () {
          
          // 타이머 종료
          clearTimeout(timer);
          timer = null;
          
          // 값 초기화
          sendX = 0;
          sendY = 0;
          
          this.animate({
            cx: ox,
            cy: oy,
            fill: 'gray'
          }, 30, 'back-in');
        
        }
      
      );
  }
  
  function setMovement(dx, dy) {
    sendX = dx;
    sendY = dy;
  }
  
  function sendMovement() {
    clearTimeout(timer);
    
    var x = sendX,
      y = sendY,
      
      // 다음 실행할 시간, 기본 50ms
      nextTime = 50,
      
      // 0=위, 1=오른쪽, 2=아래, 3=왼쪽, 4=버튼1, 5=버튼2
      data = [0, 0, 0, 0, 0, 0];
    
    if (isNaN(x) || isNaN(y)) {
      timer = setTimeout(sendMovement, nextTime);
      return;
    }
    
    makeData(x, y, data);
    
    // 전송한다.
    sc.sendMovement(data);
    
    /*
    // x,y값에 따라 재호출 시간을 단축한다.
    // 가속도 옵션은 사용하지 않기로 결정함.
    var timeRatio = Math.max(Math.abs(x), Math.abs(y)) / THRESHOLD;
    nextTime = nextTime * (1 - timeRatio);
    */
    
    timer = setTimeout(sendMovement, nextTime);
  }
  
  function makeData(x, y, data) {
    // 0=위, 1=오른쪽, 2=아래, 3=왼쪽, 4=버튼1, 5=버튼2
    var tan = Math.tan,
      abs = Math.abs,
      PI = Math.PI;
    
    // x가 0보다 큰 경우
    if (x > 0) {
      
      if (abs(y) < x * tan(PI*20/180)) { // 우
        //console.log('오른쪽');
        data[1] = 1;
      
      } else if (abs(y) > x * tan(PI*70/180)) {
        if (y > 0) { // 하
          //console.log('아래쪽');
          data[2] = 1;
          
        } else { // 상
          //console.log('위쪽') 
          data[0] = 1;
        }
        
      } else {
        if (y > 0) { // 우하
          data[1] = 1;
          data[2] = 1;
          //console.log('오른쪽 아래');
        
        } else { // 우상
          data[1] = 1;
          data[0] = 1;
          //console.log('오른쪽 위');
        }
        
      }
    
    // x가 0보다 작은 경우 
    } else if (x < 0) {
      
      if (abs(y) > x * tan(PI*110/180)) { // 상
        
        if (y > 0) { // 하
          //console.log('아래쪽');
          data[2] = 1;
        
        } else { // 상
          //console.log('위쪽');   
          data[0] = 1;
        }
      
      } else if (abs(y) < x * tan(PI*160/180)) { // 좌
        //console.log('왼쪽');
        data[3] = 1;
      
      } else {
        if (y > 0) { // 좌하
          data[3] = 1;
          data[2] = 1;
          //console.log('왼쪽 아래');
        
        } else { // 좌상
          data[3] = 1;
          data[0] = 1;
          //console.log('왼쪽 위');
        } 
        
      }
      
      
    }
  
   
  }
  
  return {
    init: function () {
      init();
    }
  };
  
});
