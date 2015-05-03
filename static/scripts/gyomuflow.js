$(function() {

var dragging, startX, startY;
var currentRectIdSeq = 0;
var currentLineIdSeq = 0;
var selectedRectId = null;

var lineTo = function(sX, sY, eX, eY, el) {
  var l = Math.min(sX, eX)
  var t = Math.min(sY, eY)
  var x = eX - sX;
  var y = eY - sY;
  if(x < 0) {
    x = -x;
    y = -y;
    sX = eX;
    sY = eY;
  }
  el.css('left', sX);
  el.css('top', sY);
  el.width(Math.sqrt(x * x + y * y));
  el.height('0px');
  var rot = Math.atan2(y, x);
  el.css('transform-origin', 'left top');
  el.css('transform', 'rotate(' + Math.atan2(y, x) + 'rad)');
};

var rectClick = function(ev) {
  if(selectedRectId == null) {
    $(this).addClass('selected');
    selectedRectId = ev.target.id;

    currentLineIdSeq += 1;
    var lineId = 'line_' + currentLineIdSeq;
    $('#lines').append('<div id="' + lineId + '" class="line"></div>');
    $('#' + lineId).data('fromRectId', ev.target.id);

    var s = $('#' + selectedRectId);
    var sX = s.position().left + s.width() / 2;
    var sY = s.position().top + s.height() / 2;
    lineTo(sX, sY, ev.pageX, ev.pageY, $('#' + lineId));
    return false;
  } else if(selectedRectId == ev.target.id) {
      var lineId = 'line_' + currentLineIdSeq;
      $('#' + lineId).remove();
      $(this).removeClass('selected');
      selectedRectId = null;
      return false;
  } else {
    var lineId = 'line_' + currentLineIdSeq;
    var s = $('#' + selectedRectId);
    var sX = s.position().left + s.width() / 2;
    var sY = s.position().top + s.height() / 2;
    var e = $(ev.target);
    var eX = e.position().left + e.width() / 2;
    var eY = e.position().top + e.height() / 2;
    lineTo(sX, sY, eX, eY, $('#' + lineId));
    $('#' + lineId).data('toRectId', ev.target.id);

    $('#' + selectedRectId).removeClass('selected');
    selectedRectId = null;

    return false;
  }
}

$('body').mousedown(function(ev) {
  if (ev.button != 0) {
    return true;
  }
  dragging = true;
  currentRectIdSeq += 1;
  startX = ev.pageX;
  startY = ev.pageY;
  var rectId = 'rect_' + currentRectIdSeq;
  $('#rects').append('<div id=' + rectId +' class="rect"></div>');

  var rectId = 'rect_' + currentRectIdSeq;
  $('#' + rectId).click(rectClick);

  $('#rect_guide').show();
  $('#rect_guide').css('left', ev.pageX);
  $('#rect_guide').css('top', ev.pageY);
  return false;
});

$('body').mousemove(function(ev) {
  if(selectedRectId == null) {
    return true;
  }
  var s = $('#' + selectedRectId);
  var sX = s.position().left + s.width() / 2;
  var sY = s.position().top + s.height() / 2;
  var lineId = 'line_' + currentLineIdSeq;
  lineTo(sX, sY, ev.pageX, ev.pageY, $('#' + lineId));
});

$('body').click(function(ev) {
  if(selectedRectId == null) {
    return true;
  }
  var lineId = 'line_' + currentLineIdSeq;
  $('#' + lineId).remove();
  $('#' + selectedRectId).removeClass('selected');
  selectedRectId = null;
  return false;
});

$('body').keyup(function(ev) {
  if (selectedRectId != null) {
    if (ev.keyCode == 46) {
      var toRemove = [];
      for(i = 0; i < $('.line').length; i++) {
        var id = $('.line')[i].id;
        if (selectedRectId == $('#' + id).data('fromRectId')
         || selectedRectId == $('#' + id).data('toRectId')) {
          toRemove.push(id);
        }
      }
      for(i = 0; i < toRemove.length; i++) {
        $('#' + toRemove[i]).remove();
      }
      $('#' + selectedRectId).remove();
      selectedRectId = null;
    }
  }
});

$('body').mousemove(function(ev) {
  if(!dragging) {
    return true;
  }
  if (ev.button != 0) {
    return true;
  }
  var rectId = 'rect_' + currentRectIdSeq;
  var l = Math.min(startX, ev.pageX)
  var w = Math.abs(startX - ev.pageX)
  var t = Math.min(startY, ev.pageY)
  var h = Math.abs(startY - ev.pageY)
  $('#' + rectId).css('left', l);
  $('#' + rectId).css('top', t);
  $('#' + rectId).width(w)
  $('#' + rectId).height(h);
  $('#' + rectId).height(h);

  var d = startX < ev.pageX ? (startY < ev.pageY ? 'se' : 'ne') : (startY < ev.pageY ? 'sw' : 'nw');
  $('#' + rectId).toggleClass('ne', d == 'ne');
  $('#' + rectId).toggleClass('se', d == 'se');
  $('#' + rectId).toggleClass('sw', d == 'sw');
  $('#' + rectId).toggleClass('nw', d == 'nw');

  $('#rect_guide').css('left', ev.pageX);
  $('#rect_guide').css('top', ev.pageY);

  return false;
});

$('body').mouseup(function(ev) {
  if(!dragging) {
    return true;
  }
  if (ev.button != 0) {
    return true;
  }
  var rectId = 'rect_' + currentRectIdSeq;
  var l = Math.min(startX, ev.pageX)
  var w = Math.abs(startX - ev.pageX)
  var t = Math.min(startY, ev.pageY)
  var h = Math.abs(startY - ev.pageY)
  if(w < 10 || h < 10) {
    $('#' + rectId).remove();
  } else {
    $('#' + rectId).css('left', l);
    $('#' + rectId).css('top', t);
    $('#' + rectId).width(w)
    $('#' + rectId).height(h);

    var d = startX < ev.pageX ? (startY < ev.pageY ? 'se' : 'ne') : (startY < ev.pageY ? 'sw' : 'nw');
    $('#' + rectId).data('dir', d);
    $('#' + rectId).toggleClass('ne', d == 'ne');
    $('#' + rectId).toggleClass('se', d == 'se');
    $('#' + rectId).toggleClass('sw', d == 'sw');
    $('#' + rectId).toggleClass('nw', d == 'nw');
  }
  dragging = false;
  $('#rect_guide').hide();
  return false;
});

$('#save').click(function() {
  var i;
  var data = {
    name: $('img').attr('src'),
    currentRectIdSeq: currentRectIdSeq,
    currentLineIdSeq: currentLineIdSeq,
    rects: [],
    lines: [],
  };
  for(i = 0; i < $('.rect').length; i++) {
    var id = $('.rect')[i].id;
    data.rects.push({
      id: id,
      dir: $('#' + id).data('dir'),
      left: $('#' + id).css('left'),
      top: $('#' + id).css('top'),
      width: $('#' + id).width(),
      height: $('#' + id).height(),
    });
  }
  for(i = 0; i < $('.line').length; i++) {
    var id = $('.line')[i].id;
    data.lines.push({
      id: id,
      from: $('#' + id).data('fromRectId'),
      to: $('#' + id).data('toRectId'),
    });
  }
  $.post('/', JSON.stringify(data));
});

$('#rect_guide').hide();
});
