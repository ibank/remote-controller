define([
  'jquery',
  'ctrl/socket-connector',
  'ctrl/ctrl-ui',
  'bootstrap'
], function ($, sc, ctrlUI) {
  
  // 연결 버튼
  $('#connect').click(function (e) {
    var roomKey = $('#room-key').val();
    sc.connect(roomKey, function () {
      // 성공
      $('.alert').hide();
      $('#join-area').hide();
      
      $('#ctrl-area').show();
      ctrlUI.init(); 
      
      // 주소줄을 감춘다.
      $('body').height(600).scrollTop(1);
     
    }, function () {
      // 실패
      $('.alert').show();
      
    });
  });

  // 닫기 버튼  
  $('.alert')
    .on('click', '.close', function (e) {
      $('.alert').fadeOut();
      e.preventDefault();
    });
    
  // 화면 스크롤을 잠근다.
  $(document).on('touchmove', function (e) {
    e.preventDefault();
  });
    
  return {

  };
  
});
