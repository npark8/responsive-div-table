//doubly-linked-list source code from https://rawgit.com/andrewrjones/doubly-linked-list-js/master/doubly-linked-list.js

/** This version introduces a usable swipe table object for multiple rendering purposes
 * x indicates appropriate indexing for convenience
 * 
 * USE "autoSwipeClasses" class for table-tags (i.e. <table class="autoSwipeClasses ...">)
 * to automatically generate classnames
 * 
 * div-tag tables has to be initialized with class names as the following:
 * DivTable 	(corresponds to <table>)
 * DivTableRow  (corresponds to <tr>)
 * col_x 		(corresponds to <td> and <th>)
 */

/* constructor 
 * @colList - doubly linked list that holds class names for table columns
 * @x_Col - pointer to relative columns
 * @btn_x - buttons associated with a swipe table
 * */
var TABLET_VIEW = 992;
var MOBILE_VIEW = 580;

function SwipeTable(colList, btnPrev, btnNext) {
	this.colList = colList;
	this.currCol = null;
	this.prevCol = null;
	this.nextCol = null;
	this.btnPrev = btnPrev;
	this.btnNext = btnNext;
	this.tableNo = null;
}

/* initialize contents of doubly linked lists with column class names*/
SwipeTable.prototype.initCol = function(index, tableID, currCol) {
	var elParent = document.getElementsByClassName("divTable");
	//declare visual viewport width
	var viewport = (window.innerWidth<=screen.width)?window.innerWidth:screen.width;

	if(typeof elParent != 'undefined' && elParent){
		var initialized = false;
		for (var i = 0; i < elParent.length; i++) {
			if (initialized)
				break;
			if(elParent[i].id != tableID) continue;
			if (!$(elParent[i]).hasClass("initialized")) {
				if ($(elParent[i]).hasClass("pass")) {
					$(elParent[i]).addClass("initialized");
					initialized = true;
					break;
				}
				var el = elParent[i].getElementsByClassName("divTableRow");
				this.tableNo = index[0]-1;//adjusting index which is starting from 1 originally;
				// only need to parse the first header row, from second column (first is fixed)
				if (el[0].children.length != 0) {
					for (var j = 1; j < el[0].children.length; j++) {
						var colName = ".divTable:eq("  + this.tableNo + ") ."
							+ el[0]["children"][j].className.split(" ")[0];
						this.colList.append(colName);
					}
					$(elParent[i]).addClass("initialized");
					initialized = true;
					break;
				}
			}
		}
		var savedCol = null;
		for(var i =0; i<this.colList.size(); i++){
			if(currCol == this.colList.item(i).data){
				savedCol = this.colList.item(i);
				break;
			}
		}
		this.currCol = (savedCol)?savedCol:this.colList.head();
		prevScreen = viewport;
		this.init(savedCol);
	}
};

/*
 * initializes table view according to screen width size: mode1 - desktop
 * (screen=>800px); full columns table mode2 - tablets/desktop (screen>480px and
 * screen<800px); three columns only mode3 - phones (screen<=480px); one
 * columns only @colList stores columns according to screen mode @xxxCol are the
 * pointers of the current table view window; @prevScreen tracks previous screen
 * size before window resize
 */
SwipeTable.prototype.init = function(savedCol) {
	if (this.currCol != null) {
		//declare visual viewport width
		var viewport = (window.innerWidth<=screen.width)?window.innerWidth:screen.width;

		// turn off both buttons at a desktop mode
		// define global behavior for all table buttons
		if (viewport >= TABLET_VIEW) {
			$('.button').prop('disabled', true);
			$('.button').css({
				color : '#ccc'
			});
			this.showAllCol();
			this.determineButtonStatus(-1);
		} else {
			// turn off previous button initially, change style to disabled
			// set each of the column pointers
			document.getElementsByClassName("button")[0].disabled = true;
			$('.previous').css({
				color : '#ccc'
			});
			// set tablet view column pointers accordingly if applicable
			if(this.colList._length > 1){
				//@ head column or no previously saved column
				if(!savedCol || savedCol.data==this.colList.head().data){
					this.currCol = this.colList.head().next;
					this.prevCol = this.currCol.prev;
					this.nextCol = this.currCol.next;
				}
				else{
					//@last column
					if(!this.currCol.next){
						this.nextCol = this.currCol;
						this.currCol = this.currCol.prev;
						this.prevCol = this.currCol.prev;
					}
					else{//@any column in between head/tail
						this.prevCol = this.currCol.prev;
						this.nextCol = this.currCol.next;
					}
				}
			}
			// only show the first three columns in tablet view
			this.hideAllExcept(this.currCol, this.prevCol, this.nextCol);
			
			// only show the current column in mobile view
			// reset the pointer
			var flag = 0; //indicate tablet view
			if (viewport <= MOBILE_VIEW) {
				flag = 1;//indicate mobile view
				this.currCol = (!savedCol || savedCol.data==this.colList.head().data)?this.colList.head():savedCol;
				this.prevCol = null;
				this.nextCol = null;
				this.hideAllExcept(this.currCol, this.prevCol, this.nextCol);
			}
			this.determineButtonStatus(flag);
		}
	}
	else this.determineButtonStatus(1);
	this.updatePrevBtn();
	this.updateNextBtn();
};

/*determines the visibility of swipe buttons based on the number of columns*/
SwipeTable.prototype.determineButtonStatus = function(flag){
	// hide button on desktop view; do not show buttons on tablet mode if there are three or less columns 
	// same for mobile mode for one or zero column
	var buttonDiv = document.getElementById(this.btnNext).parentNode;
	if(flag==-1){
		$(buttonDiv).css({
			display : 'none'
		});
	}
	else{
		if((flag==0 && this.colList._length <= 3)||
				(flag==1 && this.colList._length <= 1)){
			document.getElementById(this.btnNext).disabled = true;
			$(buttonDiv).css({
				display : 'none'
			});
		}
		else{ //display buttons as default and let the update functions decide on button availability
			$(buttonDiv).css({
				display : ''
			});
		}
	}
};

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
	if(this.colList.head()!=null){
		//declare visual viewport width
		var viewport = (window.innerWidth<=screen.width)?window.innerWidth:screen.width;

		if(this.colList._length > 1){
			if (viewport >= TABLET_VIEW) {
				$('.button').prop('disabled', true);
				$('.button').css({
					color : '#ccc'
				});
				this.showAllCol();
				this.currCol = this.colList.head();
				this.prevCol = null;
				this.nextCol = null;
				this.determineButtonStatus(-1);
			} else {
				if (viewport <= MOBILE_VIEW) {
					// tablet to mobile view
					// decrement column pointer to left most column of current window
					// view
					if (prevScreen > MOBILE_VIEW && prevScreen < TABLET_VIEW) {
						if (this.prevCol != null) {
							this.currCol = this.prevCol;
						}
					}// desktop to mobile view
					this.prevCol = null;
					this.nextCol = null;
					this.hideAllExcept(this.currCol, this.prevCol, this.nextCol);
					this.determineButtonStatus(1);
					this.updatePrevBtn();
					this.updateNextBtn();
				} else {
					// desktop or mobile to tablet view
					if (this.prevCol == null && this.nextCol == null) {
						// mobile to tablet view
						if (prevScreen <= MOBILE_VIEW) {
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
							this.determineButtonStatus(0);
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
						this.updatePrevBtn();
						this.updateNextBtn();
					}
				}
			}
		}
		else{ // handles edge case for one or zero column 
			this.hideAllExcept(this.currCol, this.prevCol, this.nextCol);
			this.updatePrevBtn();
			this.updateNextBtn();
		}
	}
};
/*
 * hide current column and show new column on left/right if exists update
 * current column pointer accordingly
 */
SwipeTable.prototype.goToPrev = function() {
	if(this.colList.head()!=null){
		//declare visual viewport width
		var viewport = (window.innerWidth<=screen.width)?window.innerWidth:screen.width;

		if (viewport <= MOBILE_VIEW) {
			if (this.currCol.prev != null) {
				$(this.currCol.data).hide();
				this.currCol = this.currCol.prev;
				$(this.currCol.data).show();
			}
		} else if (viewport < TABLET_VIEW) {
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
	}
};
SwipeTable.prototype.goToNext = function() {
	if(this.colList.head()!=null){
		//declare visual viewport width
		var viewport = (window.innerWidth<=screen.width)?window.innerWidth:screen.width;

		if (viewport <= MOBILE_VIEW) {
			if (this.currCol.next != null) {
				$(this.currCol.data).hide();
				this.currCol = this.currCol.next;
				$(this.currCol.data).show();
			}
		} else if (viewport < TABLET_VIEW) {
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
	}
};
/*
 * updates button status appropriately: -enable previous button if there are
 * elements to the left -disable previous button if there are none -enable next
 * button if there are elements to the right -disable next button if there are
 * none
 */

/* change to getElementById & test */
SwipeTable.prototype.updatePrevBtn = function() {
	if(this.colList.head()!=null){
		//declare visual viewport width
		var viewport = (window.innerWidth<=screen.width)?window.innerWidth:screen.width;

		if (viewport <= MOBILE_VIEW) {
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
		} else if (viewport < TABLET_VIEW) {
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
	}
};
SwipeTable.prototype.updateNextBtn = function() {
	if(this.colList.head()!=null){
		//declare visual viewport width
		var viewport = (window.innerWidth<=screen.width)?window.innerWidth:screen.width;

		if (viewport <= MOBILE_VIEW) {
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
		} else if (viewport < TABLET_VIEW) {
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
	}
};

