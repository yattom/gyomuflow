$(function() {

var drawrect = {
  dragging: false,
  startX: 0,
  startY: 0,
  currentRectIdSeq: 0,

  createRect: function(ev) {
    this.createBaseRect(ev);
    $('#rect_guide').css('left', ev.pageX);
    $('#rect_guide').css('top', ev.pageY);
  },
  createBaseRect: function(ev) {
    this.currentRectIdSeq += 1;
    this.startX = ev.pageX;
    this.startY = ev.pageY;
    var rectId = 'rect_' + this.currentRectIdSeq;
    $('#rects').append('<div id=' + rectId +' class="rect"></div>');

    var rectId = 'rect_' + this.currentRectIdSeq;
    $('#' + rectId).click(drawline.rectClick);

    $('#rect_guide').show();
    return rectId;
  },
  removeRect: function(rectId) {
    var i;
    var lineIdToRemove = [];
    for(i = 0; i < $('.line').length; i++) {
      var id = $('.line')[i].id;
      if (rectId  == $('#' + id).data('fromRectId')
       || rectId  == $('#' + id).data('toRectId')) {
        lineIdToRemove.push(id);
      }
    }
    for(i = 0; i < lineIdToRemove.length; i++) {
      $('#' + lineIdToRemove[i]).remove();
    }

    for(i = 0; i < $('.rect').length; i++) {
      var el = $($('.rect')[i]);
      if(!el.data('groupMember')) {
        continue;
      }
      var idx = el.data('groupMember').indexOf(rectId);
      if(idx >= 0) { el.data('groupMember').splice(idx, 1); }
      drawrect.resizeGroup(el[0].id);
    }
    $('#' + rectId).remove();
  },
  resizeRect: function(cursorX, cursorY) {
    var rectId = 'rect_' + this.currentRectIdSeq;
    var l = Math.min(this.startX, cursorX)
    var w = Math.abs(this.startX - cursorX)
    var t = Math.min(this.startY, cursorY)
    var h = Math.abs(this.startY - cursorY)
    $('#' + rectId).css('left', l);
    $('#' + rectId).css('top', t);
    $('#' + rectId).width(w)
    $('#' + rectId).height(h);
    $('#' + rectId).height(h);

    var d = this.startX < cursorX ? (this.startY < cursorY ? 'se' : 'ne') : (this.startY < cursorY ? 'sw' : 'nw');
    $('#' + rectId).toggleClass('ne', d == 'ne');
    $('#' + rectId).toggleClass('se', d == 'se');
    $('#' + rectId).toggleClass('sw', d == 'sw');
    $('#' + rectId).toggleClass('nw', d == 'nw');

    $('#rect_guide').css('left', cursorX);
    $('#rect_guide').css('top', cursorY);
  },
  createGroupRect: function(ev) {
    var rectId = drawrect.createBaseRect(ev);
    $('#' + rectId).addClass('group');
    $('#' + rectId).data('groupMember', []);
    return rectId;
  },
  addToGroup: function(groupId, rectId) {
    if($('#' + groupId).data('groupMember').indexOf(rectId) >= 0) {
      return;
    }
    var rectIds = $('#' + groupId).data('groupMember');
    rectIds.push(rectId);
    this.resizeGroup(groupId);
  },
  resizeGroup: function(groupId) {
    var i;
    var l, r, t, b;
    var rectIds = $('#' + groupId).data('groupMember');
    for(i = 0; i < rectIds.length; i++) {
      var target = $('#' + rectIds[i]);
      var t_l = target.position().left;
      var t_r = target.position().left + target.width();
      var t_t = target.position().top;
      var t_b = target.position().top + target.height();
      if(!(l < t_l)) { l = t_l; }
      if(!(r > t_r)) { r = t_r; }
      if(!(t < t_t)) { t = t_t; }
      if(!(b > t_b)) { b = t_b; }
    }
    margin = 8;
    $('#' + groupId).css('left', l - margin);
    $('#' + groupId).css('top', t - margin);
    $('#' + groupId).width(r - l + margin * 2);
    $('#' + groupId).height(b - t + margin * 2);
  },
  isInGroup: function(rectId) {
    return drawrect.getGroupRectId(rectId) != null;
  },
  getGroupRectId: function(rectId) {
    for(i = 0; i < $('.rect').length; i++) {
      var el = $($('.rect')[i]);
      if(!el.data('groupMember')) {
        continue;
      }
      var idx = el.data('groupMember').indexOf(rectId);
      if(idx >= 0) {
        return el[0].id;
      }
    }
    return null;
  }
};

var drawline = {
  currentLineIdSeq: 0,
  selectedRectId: null,

  rectClick: function(ev) {
    if(drawline.selectedRectId == null) {
      $(this).addClass('selected');
      drawline.selectedRectId = ev.target.id;

      drawline.currentLineIdSeq += 1;
      var lineId = 'line_' + drawline.currentLineIdSeq;
      $('#lines').append('<div id="' + lineId + '" class="line"></div>');
      $('#' + lineId).data('fromRectId', ev.target.id);

      var s = $('#' + drawline.selectedRectId);
      var sX = s.position().left + s.width() / 2;
      var sY = s.position().top + s.height() / 2;
      drawline.lineTo(sX, sY, ev.pageX, ev.pageY, $('#' + lineId));
      return false;
    } else if(drawline.selectedRectId == ev.target.id) {
        var lineId = 'line_' + drawline.currentLineIdSeq;
        $('#' + lineId).remove();
        $(this).removeClass('selected');
        drawline.selectedRectId = null;
        return false;
    } else if(ev.shiftKey) {
      if(drawrect.isInGroup(drawline.selectedRectId)) {
        var groupRectId = drawrect.getGroupRectId(drawline.selectedRectId);
        drawrect.addToGroup(groupRectId, ev.target.id);
      } else {
        var groupRectId = drawrect.createGroupRect(ev);
        drawrect.addToGroup(groupRectId, drawline.selectedRectId);
        drawrect.addToGroup(groupRectId, ev.target.id);
      }
    } else {
      var lineId = 'line_' + drawline.currentLineIdSeq;
      var s = $('#' + drawline.selectedRectId);
      var sX = s.position().left + s.width() / 2;
      var sY = s.position().top + s.height() / 2;
      var e = $(ev.target);
      var eX = e.position().left + e.width() / 2;
      var eY = e.position().top + e.height() / 2;
      drawline.lineTo(sX, sY, eX, eY, $('#' + lineId));
      $('#' + lineId).data('toRectId', ev.target.id);

      $('#' + drawline.selectedRectId).removeClass('selected');
      drawline.selectedRectId = null;

      return false;
    }
  },
  lineTo: function(sX, sY, eX, eY, el) {
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
  },
}


$('body').mousedown(function(ev) {
  if (ev.button != 0) {
    return true;
  }
  drawrect.dragging = true;
  drawrect.createRect(ev);
  return false;
});

$('body').mousemove(function(ev) {
  if(drawline.selectedRectId == null) {
    return true;
  }
  if(ev.shiftKey) {
    var lineId = 'line_' + drawline.currentLineIdSeq;
    $('#' + lineId).hide();
  } else {
    $('#' + drawline.selectedRectId).show();
    var s = $('#' + drawline.selectedRectId);
    var sX = s.position().left + s.width() / 2;
    var sY = s.position().top + s.height() / 2;
    var lineId = 'line_' + drawline.currentLineIdSeq;
    drawline.lineTo(sX, sY, ev.pageX, ev.pageY, $('#' + lineId));
    $('#' + lineId).show();
  }
});

$('body').click(function(ev) {
  if(drawline.selectedRectId == null) {
    return true;
  }
  var lineId = 'line_' + drawline.currentLineIdSeq;
  $('#' + lineId).remove();
  $('#' + drawline.selectedRectId).removeClass('selected');
  drawline.selectedRectId = null;
  return false;
});

$('body').keyup(function(ev) {
  if (drawline.selectedRectId != null) {
    if (ev.keyCode == 46) {
      drawrect.removeRect(drawline.selectedRectId);
      drawline.selectedRectId = null;
    }
  }
});

$('body').mousemove(function(ev) {
  if(!drawrect.dragging) {
    return true;
  }
  if (ev.button != 0) {
    return true;
  }
  drawrect.resizeRect(ev.pageX, ev.pageY);
  return false;
});

$('body').mouseup(function(ev) {
  if(!drawrect.dragging) {
    return true;
  }
  if (ev.button != 0) {
    return true;
  }
  var rectId = 'rect_' + drawrect.currentRectIdSeq;
  var l = Math.min(drawrect.startX, ev.pageX)
  var w = Math.abs(drawrect.startX - ev.pageX)
  var t = Math.min(drawrect.startY, ev.pageY)
  var h = Math.abs(drawrect.startY - ev.pageY)
  if(w < 10 || h < 10) {
    $('#' + rectId).remove();
  } else {
    $('#' + rectId).css('left', l);
    $('#' + rectId).css('top', t);
    $('#' + rectId).width(w)
    $('#' + rectId).height(h);

    var d = drawrect.startX < ev.pageX ? (drawrect.startY < ev.pageY ? 'se' : 'ne') : (drawrect.startY < ev.pageY ? 'sw' : 'nw');
    $('#' + rectId).data('dir', d);
    $('#' + rectId).toggleClass('ne', d == 'ne');
    $('#' + rectId).toggleClass('se', d == 'se');
    $('#' + rectId).toggleClass('sw', d == 'sw');
    $('#' + rectId).toggleClass('nw', d == 'nw');
  }
  drawrect.dragging = false;
  $('#rect_guide').hide();
  return false;
});

$('#save').click(function() {
  var i;
  var data = {
    name: $('img').attr('src'),
    currentRectIdSeq: drawrect.currentRectIdSeq,
    currentLineIdSeq: drawline.currentLineIdSeq,
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
