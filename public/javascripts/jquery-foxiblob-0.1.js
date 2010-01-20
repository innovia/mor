/**
 * name:          jquery-foxiblob-0.1.js
 * author:        Stefan Benicke - www.opusonline.at
 * version:       0.1
 * last update:   19.08.2009
 * category:      jQuery plugin
 * copyright:     (c) 2009 Stefan Benicke (www.opusonline.at)
 * license:       GNU GPLv3
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * documentation: http://www.opusonline.at/foxitools/foxiblob/
 */
(function($) {
	$.fn.foxiblob = function(settings) {

		settings = jQuery.extend({
      active: 'active',
      opacity: 0.3,
      speed: 'normal',
      className: 'foxiblob',
			callback: function(){}
		}, settings);

    var li_active = "";
    var counter = 0;
    var blob_padding_top;
    var blob_padding_left;
    var blob_border_top;
    var blob_border_left;
    var blob_border_right;
    var blob_border_bottom;

    // check for other blobs
    $('body').find('div[id^="foxiblob"]').each(function(){
      counter++;
    });
    
    var id = '#foxiblob'+counter;

    $('body').append('<div id="foxiblob'+counter+'" class="'+settings.className+'"></div>');

    // set the rel to blob of parent ul
    $(this).attr('rel', id);
    
    // li-elements have to be over the blob
    var new_z_index = parseInt($(id).css('z-index')) + 1;

    // every child li
    $(this).find('li').each(function(){

      // main function
      $(this).bind('mouseenter', function(){
        go($($(this).parent().attr('rel')), $(this));
      })
      .css({'position':'relative', 'z-index':new_z_index});
    });

    // set the blob to the active list
    $(this).find('li.'+settings.active).each(function(){
      li_active = $(this);
    });
    // if no class active is found, take the first list
    if(!li_active)
      li_active = $($(this).find('li:first'));
      
    li_active.addClass('foxiblob_active');

    // init
    // set blob size and position to active list
    getDimensions($($(this).attr('rel')));
    $(id).css({
      'top':li_active.offset().top - blob_padding_top,
      'left':li_active.offset().left - blob_padding_left,
      'width':li_active.outerWidth() - blob_border_left - blob_border_right,
      'height':li_active.outerHeight() - blob_border_top - blob_border_bottom
    });

    // fix ie6 bug with opacity
    if($.browser.msie && $.browser.version <= 6){}
    else $(id).css('opacity', settings.opacity);

    // return to active list when leaving ul
    $(this).bind('mouseleave', function(){
      go($($(this).attr('rel')), $(this).find('li.foxiblob_active'));
    });

    // animate the blob
    function go(blob, li){
      getDimensions(blob);

      var blob_top = li.offset().top - blob_padding_top;
      var blob_left = li.offset().left - blob_padding_left;
      var blob_width = li.outerWidth() - blob_border_left - blob_border_right;
      var blob_height = li.outerHeight() - blob_border_top - blob_border_bottom;

      blob.animate({'top':blob_top,
        'left':blob_left,
        'width':blob_width,
        'height':blob_height
      }, {queue:false}, settings.speed);
    }

    function getDimensions(blob){
      blob_padding_top = parseInt(blob.css('paddingTop'));
      blob_padding_left = parseInt(blob.css('paddingLeft'));
      blob_border_top = parseInt(blob.css('borderTopWidth'));
      blob_border_left = parseInt(blob.css('borderLeftWidth'));
      blob_border_right = parseInt(blob.css('borderRightWidth'));
      blob_border_bottom = parseInt(blob.css('borderBottomWidth'));

      // prevent msie strings in border-width
      if(!blob_border_top) blob_border_top = 0;
      if(!blob_border_left) blob_border_left = 0;
      if(!blob_border_bottom) blob_border_bottom = 0;
      if(!blob_border_right) blob_border_right = 0;
    }
  }
})(jQuery);
