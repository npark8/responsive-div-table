//doubly-linked-list source code from https://rawgit.com/andrewrjones/doubly-linked-list-js/master/doubly-linked-list.js

/** This version introduces a usable swipe table object for multiple rendering purposes
 * x indicates appropriate indexing for convenience
 * 
 * initialize class name of elements under <divTableRow> as following: 
 * 		class = "t_x_col_x divTableHead ...etc...")
 * 			t_x_col_x can be any string as long as it is unique among the table's columns
 * 
 * initialize the swipe button class name as following: 
 * 		id = "btnPrev_x" or "btnNext_x"
 * 			btnPrev_x and btnNext_x can be any string
 * 
 * on your xhtml page, add a local script tag containing the following:
 *	 	<h:outputScript library="js" target="head">
 *		 	var colList_x = new DLL.DoublyLinkedList(); //add as many as the number of 
 *       	swipe tables presented on your page (i.e. make 3 instances for 3 swipe tables)
 *		 	var table_x = new SwipeTable(colList_x,"btnPrev1","btnNext1"); //same as above
 *		 	var prevScreen = null; //global screen size tracker
 *		 	window.addEventListener('load', table_x.initCol.bind(table_x)); //same as above
 *	 	</h:outputScript>
 */

/* constructor 
 * @colList - doubly linked list that holds class names for table columns
 * @x_Col - pointer to relative columns
 * @btn_x - buttons associated with a swipe table
 * */

function SwipeTable(colList, btnPrev, btnNext) {
	this.colList = colList;
	this.currCol = null;
	this.prevCol = null;
	this.nextCol = null;
	this.btnPrev = btnPrev;
	this.btnNext = btnNext;
}

/* initialize doubly linked lists for each swipe table */
SwipeTable.prototype.initCol = function() {
	var elParent = document.getElementsByClassName("divTable");
	var initialized = false;
	for (var i = 0; i < elParent.length; i++) {
		if (initialized)
			break;
		if (!$(elParent[i]).hasClass("initialized")) {
			var el = elParent[i].getElementsByClassName("divTableRow");
			// only need to parse the first header row, from second column (first is fixed)
			if (el[0].children.length != 0) {
				for (var j = 1; j < el[0].children.length; j++) {
					var colName = "."
						+ el[0]["children"][j].className.split(" ")[0];
					this.colList.append(colName);
				}
				$(elParent[i]).addClass("initialized");
				initialized = true;
				break;
			}
		}
	}
	this.currCol = this.colList.head();
	prevScreen = $(window).width();
	this.init();
};

/*
 * initializes table view according to screen width size: mode1 - desktop
 * (screen=>800px); full columns table mode2 - tablets/desktop (screen>480px and
 * screen<800px); three columns only mode3 - phones (screen<=480px); one
 * columns only @colList stores columns according to screen mode @xxxCol are the
 * pointers of the current table view window; @prevScreen tracks previous screen
 * size before window resize
 */
SwipeTable.prototype.init = function() {

	// turn off both buttons at a desktop mode
	// define global behavior for all table buttons
	if ($(window).width() >= 800) {
		$('.button').prop('disabled', true);
		$('.button').css({
			color : '#ccc'
		});
	} else {
		// turn off previous button initially, change style to disabled
		// set each of the column pointers
		document.getElementsByClassName("button")[0].disabled = true;
		$('.previous').css({
			color : '#ccc'
		});
		this.currCol = this.colList.head().next;
		this.prevCol = this.currCol.prev;
		this.nextCol = this.currCol.next;
		// only show the first three columns in tablet view
		this.hideAllExcept(this.currCol, this.prevCol, this.nextCol);
		// only show the first column in mobile view
		// reset the pointer
		var isTabletView = true;
		if ($(window).width() <= 480) {
			isTabletView = false;
			this.currCol = this.colList.head();
			this.prevCol = null;
			this.nextCol = null;
			this.hideAllExcept(this.currCol, this.prevCol, this.nextCol);
		}
		this.determineButtonStatus(isTabletView);
	}
};

/*determines the visibility of swipe buttons based on the number of columns*/
SwipeTable.prototype.determineButtonStatus = function(isTabletView){
	// do not show buttons on tablet mode if there are three or less columns 
	if(isTabletView && (this.nextCol==null || this.nextCol.next==null)){
		document.getElementById(this.btnNext).disabled = true;
		$('#'+this.btnNext).css({
			display : 'none'
		});
		$('#'+this.btnPrev).css({
			display : 'none'
		});
	}
	else{ //display buttons as default and let the update functions decide on button availability
		$('#'+this.btnNext).css({
			display : ''
		});
		$('#'+this.btnPrev).css({
			display : ''
		});
	}
}
/* hides all columns except the column pointed by currCol */
SwipeTable.prototype.hideAllExcept = function(currCol, prevCol, nextCol) {
	if (currCol != null && prevCol == null && nextCol == null) {
		for (var i = 0; i < this.colList.size(); i++) {
			var temp = this.colList.item(i);
			if (temp != currCol) {
				$(temp.data).hide();
			} else {
				$(temp.data).show();
			}
		}
	} else {
		for (var i = 0; i < this.colList.size(); i++) {
			var temp = this.colList.item(i);
			if (temp != currCol && temp != prevCol && temp != nextCol) {
				$(temp.data).hide();
			} else {
				$(temp.data).show();
			}
		}
	}
};
/* show all columns */
SwipeTable.prototype.showAllCol = function() {
	for (var i = 0; i < this.colList.size(); i++) {
		var temp = this.colList.item(i);
		$(temp.data).show();
	}
};
/*
 * reconfigures to each mode do not reset currCol pointer
 */
SwipeTable.prototype.reconfig = function() {
	// mobile or tablet to desktop view
	if ($(window).width() >= 800) {
		$('.button').prop('disabled', true);
		$('.button').css({
			color : '#ccc'
		});
		this.showAllCol();
		this.currCol = this.colList.head();
		this.prevCol = null;
		this.nextCol = null;
	} else {
		if ($(window).width() <= 480) {
			// tablet to mobile view
			// decrement column pointer to left most column of current window
			// view
			if (prevScreen > 480 && prevScreen < 800) {
				if (this.prevCol != null) {
					this.currCol = this.prevCol;
				}
			}// desktop to mobile view
			this.prevCol = null;
			this.nextCol = null;
			this.hideAllExcept(this.currCol, this.prevCol, this.nextCol);
			this.determineButtonStatus(false);
			this.updatePrevBtn();
			this.updateNextBtn();
		} else {
			// desktop or mobile to tablet view
			if (this.prevCol == null && this.nextCol == null) {
				// mobile to tablet view
				if (prevScreen <= 480) {
					if (this.currCol.next != null
							&& this.currCol.next.next != null) {
						this.prevCol = this.currCol;
						this.currCol = this.currCol.next;
						this.nextCol = this.currCol.next;
					}
					// currCol is second last column
					else if (this.currCol.next != null) {
						this.prevCol = this.currCol.prev;
						this.nextCol = this.currCol.next;
					}
					// currCol is the last column
					// decrement column pointer
					else {
						this.nextCol = this.currCol;
						this.currCol = this.currCol.prev;
						this.prevCol = this.currCol.prev;
					}
					this.hideAllExcept(this.currCol, this.prevCol,
							this.nextCol);
					this.updatePrevBtn();
					this.updateNextBtn();
				}
				// desktop to tablet view
				else {
					this.init();
				}
			} else {// tablet to tablet view
				// user previously looking at the first column
				if (this.prevCol == null) {
					this.prevCol = this.currCol;
					this.currCol = this.currCol.next;
					this.nextCol = this.currCol.next;
				}
				// user previously looking at the last column
				else if (this.nextCol == null) {
					this.nextCol = this.currCol;
					this.currCol = this.currCol.prev;
					this.prevCol = this.currCol.prev;
				}
				this.hideAllExcept(this.currCol, this.prevCol, this.nextCol);
				this.determineButtonStatus(true);
				this.updatePrevBtn();
				this.updateNextBtn();
			}
		}
	}
};
/*
 * hide current column and show new column on left/right if exists update
 * current column pointer accordingly
 */
SwipeTable.prototype.goToPrev = function() {
	if ($(window).width() <= 480) {
		if (this.currCol.prev != null) {
			$(this.currCol.data).hide();
			this.currCol = this.currCol.prev;
			$(this.currCol.data).show();
		}
	} else if ($(window).width() < 800) {
		if (this.prevCol.prev != null) {
			this.nextCol = this.currCol;
			this.currCol = this.prevCol;
			this.prevCol = this.prevCol.prev;
			$(this.currCol.prev.data).show();
		}
		if (this.nextCol.next != null) {
			$(this.nextCol.next.data).hide();
		}
	}
	this.updatePrevBtn();
	this.updateNextBtn();
};
SwipeTable.prototype.goToNext = function() {
	if ($(window).width() <= 480) {
		if (this.currCol.next != null) {
			$(this.currCol.data).hide();
			this.currCol = this.currCol.next;
			$(this.currCol.data).show();
		}
	} else if ($(window).width() < 800) {
		if (this.nextCol.next != null) {
			this.prevCol = this.currCol;
			this.currCol = this.nextCol;
			this.nextCol = this.nextCol.next;
			$(this.currCol.next.data).show();
		}
		if (this.prevCol.prev != null) {
			$(this.prevCol.prev.data).hide();
		}
	}
	this.updatePrevBtn();
	this.updateNextBtn();
};
/*
 * updates button status appropriately: -enable previous button if there are
 * elements to the left -disable previous button if there are none -enable next
 * button if there are elements to the right -disable next button if there are
 * none
 */

/* change to getElementById & test */
SwipeTable.prototype.updatePrevBtn = function() {
	if ($(window).width() <= 480) {
		if (this.currCol.prev != null) {
			document.getElementById(this.btnPrev).disabled = false;
			$('#'+this.btnPrev).css({
				color : 'black'
			});
		} else {
			document.getElementById(this.btnPrev).disabled = true;
			$('#'+this.btnPrev).css({
				color : '#ccc'
			});
		}
	} else if ($(window).width() < 800) {
		if (this.prevCol != null && this.prevCol.prev != null) {
			document.getElementById(this.btnPrev).disabled = false;
			$('#'+this.btnPrev).css({
				color : 'black'
			});
		} else {
			document.getElementById(this.btnPrev).disabled = true;
			$('#'+this.btnPrev).css({
				color : '#ccc'
			});
		}
	}
};
SwipeTable.prototype.updateNextBtn = function() {
	if ($(window).width() <= 480) {
		if (this.currCol.next != null) {
			document.getElementById(this.btnNext).disabled = false;
			$('#'+this.btnNext).css({
				color : 'black'
			});
		} else {
			document.getElementById(this.btnNext).disabled = true;
			$('#'+this.btnNext).css({
				color : '#ccc'
			});
		}
	} else if ($(window).width() < 800) {
		if (this.nextCol != null && this.nextCol.next != null) {
			document.getElementById(this.btnNext).disabled = false;
			$('#'+this.btnNext).css({
				color : 'black'
			});
		} else {
			document.getElementById(this.btnNext).disabled = true;
			$('#'+this.btnNext).css({
				color : '#ccc'
			});
		}
	}
};
/* detect swipe touch motion for touch devices 
   code reference from: http://labs.rampinteractive.co.uk/touchSwipe/demos/Single_swipe.html
   @zoomTarget tracks current zoom level
*/
/*$(function(){
	$(".divTable").swipe({
	    //show previous columns when swiped right
	    swipe:function(event, direction, distance, duration, fingerCount) {
	    	if(direction=="right"){
	    		this.goToPrev();
	    	}
	    	else{
	    		this.goToNext();
	    	}
	    }
	});
});*/