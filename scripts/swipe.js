/* Doubly linked list source code from: https://rawgit.com/andrewrjones/doubly-linked-list-js/master/doubly-linked-list.js
 * credit to: andrewrjones
 * 
 * TouchSwipe source code from: https://rawgit.com/mattbryson/TouchSwipe-Jquery-Plugin/master/jquery.touchSwipe.js
 * credit to: mattbryson
 *
 * This script makes a table created with div tag responsive with the idea of swiping a set of columns to right or left in a smaller view
 * (Original idea taken from tablesaw swipe project: reference: https://github.com/filamentgroup/tablesaw)
 * Also enables swipe motion in mobile/touch devices 
 */
/*

initialize table columns with given class names
@colList stores entire table columns
@xxxCol are the pointers of the current table view window;
@prevScreen tracks previous screen size before window resize
 */

function initCol() {
	var el = document.getElementsByClassName("divTableRow");
	for (var i = 0; i < el.length; i++) {
		if (el[i].children.length != 0) {
			//exclude leftmost fixed column from being swiped
			//set j=0 to swipe columns entirely
			for (var j = 1; j < el[i].children.length; j++) {
				var colName = "."
						+ el[i]["children"][j].className.split(" ")[0];
				colList.append(colName);
			}
			break;
		}
	}
	currCol = colList.head();
	prevScreen = $(window).width();
	init();
}

/*
initializes table view according to screen width size:
	mode1 - desktop (screen=>800px); full columns table
	mode2 - tablets/desktop (screen>480px and screen<800px); three columns only
	mode3 - phones (screen<=480px); one columns only
@colList stores columns according to screen mode
@xxxCol are the pointers of the current table view window
@prevScreen tracks previous screen size before window resize
 */
function init() {

	//turn off both buttons at a desktop mode
	if ($(window).width() >= 800) {
		$('.button').prop('disabled', true);
		$('.button').css({
			color : '#ccc'
		});
	} else {
		//turn off previous button initially, change style to disabled
		//set each of the column pointers
		document.getElementsByClassName("button")[0].disabled = true;
		$('.previous').css({
			color : '#ccc'
		});
		currCol = colList.head().next;
		prevCol = currCol.prev;
		nextCol = currCol.next;
		//only show the first three columns in tablet view
		hideAllExcept(currCol,prevCol,nextCol);
		
		//only show the first column in mobile view
		//reset the pointer
		if ($(window).width() <= 480) {
			currCol = colList.head();
			prevCol = null;
			nextCol = null;
			hideAllExcept(currCol, prevCol, nextCol);
		}
	}
}
window.onload = initCol;

/*hides all columns except the column pointed by Col pointers*/
function hideAllExcept(currCol, prevCol, nextCol) {
	if (currCol!=null && prevCol == null && nextCol == null) {
		for (var i = 0; i < colList.size(); i++) {
			var temp = colList.item(i);
			if (temp != currCol) {
				$(temp.data).hide();
			}
			else{
				$(temp.data).show();
			}
		}
	} else {
		for (var i = 0; i < colList.size(); i++) {
			var temp = colList.item(i);
			if (temp != currCol && temp != prevCol && temp != nextCol) {
				$(temp.data).hide();
			}
			else{
				$(temp.data).show();
			}
		}
	}
}
/*show all columns*/
function showAllCol() {
	for (var i = 0; i < colList.size(); i++) {
		var temp = colList.item(i);
		$(temp.data).show();
	}
}

/*
 * reconfigures to each mode
 */
function reconfig() {
	//mobile or tablet to desktop view
	if ($(window).width() >= 800) {
		$('.button').prop('disabled', true);
		$('.button').css({
			color : '#ccc'
		});
		showAllCol();
		currCol = colList.head();
		prevCol = null;
		nextCol = null;
	} else {
		if ($(window).width() <= 480) {
			//tablet to mobile view
			//decrement column pointer to left most column of current window view
			if (prevScreen > 480 && prevScreen < 800) {
				if (prevCol != null) {
					currCol = prevCol;
				}
			}//desktop to mobile view
			prevCol = null;
			nextCol = null;
			hideAllExcept(currCol, prevCol, nextCol);
			updatePrevBtn();
			updateNextBtn();
		} else {
			//desktop or mobile to tablet view
			if (prevCol == null && nextCol == null) {
				//mobile to tablet view
				if (prevScreen <= 480) {
					if (currCol.next != null && currCol.next.next != null) {
						prevCol = currCol;
						currCol = currCol.next;
						nextCol = currCol.next;
					}
					//currCol is second last column
					else if (currCol.next != null) {
						prevCol = currCol.prev;
						nextCol = currCol.next;
					}
					//currCol is the last column
					//decrement column pointer 
					else {
						nextCol = currCol;
						currCol = currCol.prev;
						prevCol = currCol.prev;
					}
					hideAllExcept(currCol, prevCol, nextCol);
					updatePrevBtn();
					updateNextBtn();
				}
				//desktop to tablet view
				else {
					init();
				}
			} else {//tablet to tablet view
				//user previously looking at the first column
				if (prevCol == null) {
					prevCol = currCol;
					currCol = currCol.next;
					nextCol = currCol.next;
				}
				//user previously looking at the last column
				else if (nextCol == null) {
					nextCol = currCol;
					currCol = currCol.prev;
					prevCol = currCol.prev;
				}
				hideAllExcept(currCol, prevCol, nextCol);
				updatePrevBtn();
				updateNextBtn();
			}
		}
	}
}
$(window).resize(function() {
	reconfig();
	prevScreen = $(window).width();
});
/*
 hide current column and show new column on left/right if exists
 update current column pointer accordingly
 */
function goToPrev() {
	if ($(window).width() <= 480) {
		if (currCol.prev != null) {
			$(currCol.data).hide();
			currCol = currCol.prev;
			$(currCol.data).show();
		}
	} else if ($(window).width() < 800) {
		if (prevCol.prev != null) {
			nextCol = currCol;
			currCol = prevCol;
			prevCol = prevCol.prev;
			$(currCol.prev.data).show();
		}
		if (nextCol.next != null) {
			$(nextCol.next.data).hide();
		}
	}
	updatePrevBtn();
	updateNextBtn();
}
function goToNext() {
	if ($(window).width() <= 480) {
		if (currCol.next != null) {
			$(currCol.data).hide();
			currCol = currCol.next;
			$(currCol.data).show();
		}
	} else if ($(window).width() < 800) {
		if (nextCol.next != null) {
			prevCol = currCol;
			currCol = nextCol;
			nextCol = nextCol.next;
			$(currCol.next.data).show();
		}
		if (prevCol.prev != null) {
			$(prevCol.prev.data).hide();
		}
	}
	updatePrevBtn();
	updateNextBtn();
}

/* detect swipe touch motion for touch devices 
   code reference from: http://labs.rampinteractive.co.uk/touchSwipe/demos/Single_swipe.html
   @zoomTarget tracks current zoom level
*/
var zoomTarget = false;

$(function(){
	$(".divTable").swipe({
	    //show previous columns when swiped right
	    swipe:function(event, direction, distance, duration, fingerCount) {
	    	if(direction=="right"){
	    		goToPrev();
	    	}
	    	else{
	    		goToNext();
	    	}
	    }
	});
});

/*
updates button status appropriately: 
	-enable previous button if there are elements to the left
	-disable previous button if there are none
	-enable next button if there are elements to the right
	-disable next button if there are none
 */
function updatePrevBtn() {
	if ($(window).width() <= 480) {
		if (currCol.prev != null) {
			document.getElementsByClassName("button")[0].disabled = false;
			$('.previous').css({
				color : 'black'
			});
		} else {
			document.getElementsByClassName("button")[0].disabled = true;
			$('.previous').css({
				color : '#ccc'
			});
		}
	} else if ($(window).width() < 800) {
		if (prevCol != null && prevCol.prev != null) {
			document.getElementsByClassName("button")[0].disabled = false;
			$('.previous').css({
				color : 'black'
			});
		} else {
			document.getElementsByClassName("button")[0].disabled = true;
			$('.previous').css({
				color : '#ccc'
			});
		}
	}
}
function updateNextBtn() {
	if ($(window).width() <= 480) {
		if (currCol.next != null) {
			document.getElementsByClassName("button")[1].disabled = false;
			$('.next').css({
				color : 'black'
			});
		} else {
			document.getElementsByClassName("button")[1].disabled = true;
			$('.next').css({
				color : '#ccc'
			});
		}
	} else if ($(window).width() < 800) {
		if (nextCol != null && nextCol.next != null) {
			document.getElementsByClassName("button")[1].disabled = false;
			$('.next').css({
				color : 'black'
			});
		} else {
			document.getElementsByClassName("button")[1].disabled = true;
			$('.next').css({
				color : '#ccc'
			});
		}
	}
}