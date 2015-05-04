$(function() {

var drawrect = {
  dragging: false,
  startX: 0,
  startY: 0,
  currentRectIdSeq: 0,

  createRect: function(startX, startY, rectId=null) {
    this.createBaseRect(startX, startY, rectId);
  },
  createBaseRect: function(startX, startY, rectId=null) {
    if(rectId == null) {
      this.currentRectIdSeq += 1;
      rectId = 'rect_' + this.currentRectIdSeq;
    }
    this.startX = startX;
    this.startY = startY;
    $('#rects').append('<div id=' + rectId +' class="rect"></div>');

    $('#' + rectId).click(drawline.rectClick);

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
  resizeRect: function(cursorX, cursorY, rectId=null) {
    if(rectId == null) {
      rectId = 'rect_' + this.currentRectIdSeq;
    }
    var l = Math.min(this.startX, cursorX)
    var w = Math.abs(this.startX - cursorX)
    var t = Math.min(this.startY, cursorY)
    var h = Math.abs(this.startY - cursorY)
    $('#' + rectId).css('left', l);
    $('#' + rectId).css('top', t);
    $('#' + rectId).width(w)
    $('#' + rectId).height(h);

    var d = this.startX < cursorX ? (this.startY < cursorY ? 'se' : 'ne') : (this.startY < cursorY ? 'sw' : 'nw');
    $('#' + rectId).toggleClass('ne', d == 'ne');
    $('#' + rectId).toggleClass('se', d == 'se');
    $('#' + rectId).toggleClass('sw', d == 'sw');
    $('#' + rectId).toggleClass('nw', d == 'nw');
    $('#' + rectId).data('dir', d);

    $('#rect_guide').css('left', cursorX);
    $('#rect_guide').css('top', cursorY);
  },
  createGroupRect: function(ev) {
    var rectId = drawrect.createBaseRect(ev.pageX, ev.pageY);
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
  },
  initialize: function() {
    this.dragging = false;
    this.startX = 0;
    this.startY = 0;
    this.currentRectIdSeq = 0;
    $('#rects').empty();
  },
};

var drawline = {
  currentLineIdSeq: 0,
  startX: 0,
  startY: 0,
  selectedRectId: null,

  startLine: function(fromRectId, startX, startY, lineId=null) {
    if(lineId == null) {
      this.currentLineIdSeq += 1;
      lineId = 'line_' + drawline.currentLineIdSeq;
    }
    drawline.startX = startX;
    drawline.startY = startY;
    $('#lines').append('<div id="' + lineId + '" class="line"><div class="arrow1"></div><div class="arrow2"></div></div>');
    $('#' + lineId).data('fromRectId', fromRectId);
    $('#' + lineId).data('startX', startX);
    $('#' + lineId).data('startY', startY);
    return lineId;
  },
  finishLine: function(toRectId, endX, endY, lineId=null) {
    if(lineId == null) {
      lineId = 'line_' + drawline.currentLineIdSeq;
    }
    drawline.lineTo(endX, endY, lineId);
    $('#' + lineId).data('toRectId', toRectId);
    $('#' + lineId).data('endX', endX);
    $('#' + lineId).data('endY', endY);
  },
  rectClick: function(ev) {
    if(drawline.selectedRectId == null) {
      $(this).addClass('selected');
      drawline.selectedRectId = ev.target.id;

      drawline.startX = ev.pageX;
      drawline.startY = ev.pageY;
      drawline.startLine(ev.target.id, drawline.startX, drawline.startY);
      drawline.lineTo(ev.pageX, ev.pageY);
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
      } else if(drawrect.isInGroup(ev.target.id)) {
        var groupRectId = drawrect.getGroupRectId(ev.target.id);
        drawrect.addToGroup(groupRectId, drawline.selectedRectId);
      } else {
        var groupRectId = drawrect.createGroupRect(ev);
        drawrect.addToGroup(groupRectId, drawline.selectedRectId);
        drawrect.addToGroup(groupRectId, ev.target.id);
      }
    } else {
      drawline.finishLine(ev.target.id, ev.pageX, ev.pageY);
      $('#' + drawline.selectedRectId).removeClass('selected');
      drawline.selectedRectId = null;

      return false;
    }
  },
  lineTo: function(eX, eY, lineId=null) {
    if(lineId == null) {
      lineId = 'line_' + drawline.currentLineIdSeq;
    }
    var el = $('#' + lineId);
    var sX = this.startX;
    var sY = this.startY;
    var l = Math.min(sX, eX);
    var t = Math.min(sY, eY);
    var x = eX - sX;
    var y = eY - sY;
    if(x > 0) {
      var rot = Math.atan2(y, x);
    } else {
      var rot = Math.atan2(-y, -x);
    }
    el.css('left', sX);
    el.css('top', sY);
    el.width(Math.sqrt(x * x + y * y));
    el.height('0px');
    el.css('transform-origin', 'left top');
    el.css('transform', 'rotate(' + Math.atan2(y, x) + 'rad)');
  },
  initialize: function() {
    this.currentLineIdSeq = 0;
    this.startX = 0;
    this.startY = 0;
    this.selectedRectId = null;
    $('#lines').empty();
  },
}


$('body').mousedown(function(ev) {
  if (ev.button != 0) {
    return true;
  }
  drawrect.dragging = true;
  drawrect.createRect(ev.pageX, ev.pageY);
  $('#rect_guide').css('left', ev.pageX);
  $('#rect_guide').css('top', ev.pageY);
  $('#rect_guide').show();
  return false;
});

$('body').mousemove(function(ev) {
  if(drawline.selectedRectId == null) {
    return true;
  }
  var lineId = 'line_' + drawline.currentLineIdSeq;
  if(ev.shiftKey) {
    $('#' + lineId).hide();
  } else {
    $('#' + drawline.selectedRectId).show();
    drawline.lineTo(ev.pageX, ev.pageY);
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
  var w = Math.abs(drawrect.startX - ev.pageX)
  var h = Math.abs(drawrect.startY - ev.pageY)
  if(w < 10 || h < 10) {
    $('#' + rectId).remove();
  } else {
    drawrect.resizeRect(ev.pageX, ev.pageY);
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
      left: $('#' + id).position().left - $('.image').position().left,
      top: $('#' + id).position().top - $('.image').position().top,
      width: $('#' + id).width(),
      height: $('#' + id).height(),
      groupMember: $('#' + id).data('groupMember') ? $('#' + id).data('groupMember') : null,
    });
  }
  for(i = 0; i < $('.line').length; i++) {
    var id = $('.line')[i].id;
    data.lines.push({
      id: id,
      from: $('#' + id).data('fromRectId'),
      to: $('#' + id).data('toRectId'),
      startX: $('#' + id).data('startX') - $('.image').position().left,
      startY: $('#' + id).data('startY') - $('.image').position().top,
      endX: $('#' + id).data('endX') - $('.image').position().left,
      endY: $('#' + id).data('endY') - $('.image').position().top,
    });
  }
  $.post('/drawing', JSON.stringify(data));
});

$('#load').click(function() {
  $('#save').click();
  var i;
  var imageUrl = prompt('Enter image url');
  if(imageUrl == null) {
    return;
  }
  imageUrl = imageUrl.trim();
  $.ajax({
    url: '/drawing',
    data: {name: imageUrl},
    method: 'GET',
    success: function(raw) {
      var data = JSON.parse(raw);
      drawrect.initialize();
      drawline.initialize();

      $('.image').attr('src', imageUrl);
      offsetX = $('.image').position().left;
      offsetY = $('.image').position().top;

      for(i = 0; i < data.rects.length; i++) {
        var rect = data.rects[i];
        drawrect.createRect(rect.left + offsetX, rect.top + offsetY, rect.id);
        drawrect.resizeRect(rect.left + offsetX + rect.width, rect.top + offsetY + rect.height, rect.id);
        $('#' + rect.id).removeClass('ne nw se sw');
        if(rect.groupMember == null) {
          $('#' + rect.id).addClass(rect.dir);
          $('#' + rect.id).data('dir', rect.dir);
        } else {
          $('#' + rect.id).addClass('group');
          $('#' + rect.id).data('groupMember', rect.groupMember);
          drawrect.resizeGroup(rect.id);
        }
      }
      drawrect.currentRectIdSeq = data.currentRectIdSeq;

      for(i = 0; i < data.lines.length; i++) {
        var line = data.lines[i];
        drawline.startLine(line.from, line.startX + offsetX, line.startY + offsetY, line.id);
        drawline.finishLine(line.to, line.endX + offsetX, line.endY + offsetY, line.id);
      }
      drawline.currentLineIdSeq = data.currentLineIdSeq;
      drawline.selectedRectId = null;
    },
    error: function(jqXHR, stat) {
      console.log('error');
      if(jqXHR.status != 404) {
        return;
      }
      drawrect.initialize();
      drawline.initialize();
      $('.image').attr('src', imageUrl);
    }
  });
});

$('#rect_guide').hide();
});
