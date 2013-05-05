var firstkey = true;
var startTime = 0;
var currentTime = 0;
var globalData;
var lastBoldedIndex = -1;

$('#comment-input').keydown(function(event) {
	if (event.keyCode >= 65 && event.keyCode <= 90) { // if a letter pressed
		if (firstkey) {
			firstkey = false;
			startTime = document.getElementById("main-video").currentTime;
		}

	}
});

$("#comment-input").keyup(function(e) {
	var code = (e.keyCode ? e.keyCode : e.which);
	if (code == 13) { //Enter keycode

		var comment = document.getElementById("comment-input").value;
		var endTime = document.getElementById("main-video").currentTime;

		console.log("Adding comment:" + comment);
		console.log("with StartTime:" + startTime);
		console.log("and endTime:" + endTime);

		//TODO: need to fix.
		//add comment to popcorn instance
		var popcorn = Popcorn("#main-video");

		popcorn.footnote({
			start: 0,
			end: 5,
			target: "footnotes",
			text: comment
		});

		//display new comment for 2 seconds
		// Show the container
		$("#green-container").show();
		// Show the block
		$("#green-block").show();
		$("#green-block").html(comment);
		setTimeout(function() {
			$("#green-container").hide();
			$("#green-block").hide();
		}, 2000); // 2000 ms = 2 s


		//TODO:add comment to server

		//TODO:add to annotation-container

		//reset stuff
		startTime = 0;
		document.getElementById("comment-input").value = '';
		firstkey = true;
	}
});

function getServer() {
	$("#green-block").hide();
	$("#green-container").hide();
	var popcorn = Popcorn("#main-video");
	popcorn.on('timeupdate', function(number) {
		if (Math.floor(this.currentTime()) > currentTime) {
			currentTime = Math.floor(this.currentTime());
			populatePageWithData(currentTime);
		}
	});
	$.ajax({
		url: "http://vidersion.herokuapp.com/get?id=1",
		type: "GET",
		dataType: "jsonp",
		crossDomain: true,
		jsonp: "callback",
		// cache: false,
		jsonpCallback: "JSONPCallback",
		error: function(xhr, status, error) {
			console.log("error!");
			console.dir(error);
		},
		success: function(data) {
			globalData = data;
			populatePageWithData();
			//add to popcorn
			var popcorn = Popcorn("#main-video");
			for (var i = 0; i < globalData.length; i++) {
				//add to popcorn instance
				popcorn.footnote({
					start: i,
					end: i + 1,
					target: "blue-block",
					text: globalData[i]["text"]
				});
			}
		}
	});
}

function populatePageWithData(currentTime) {

	//add to annotation list
	globalData.sort(function(a, b) {
		if (a.start_timecode < b.start_timecode) {
			return -1;
		} else if (a.start_timecode > b.start_timecode) {
			return 1;
		} else {
			return 0;
		}
	});

	var boldedIndex = 0;
	for (var j = 0; j < globalData.length; j++) {
		if (currentTime <= globalData[j].start_timecode) {
			boldedIndex = j - 1;
			break;
		}
	}
	if (boldedIndex < 0) {
		boldedIndex = 0;
	}
	if (lastBoldedIndex === boldedIndex) {
		return;
	} else {
		lastBoldedIndex = boldedIndex;
	}

	var content = "";
	for (var i = 0; i < globalData.length; i++) {
		var comment = globalData[i];
		content += '<div class="annotation old-annotation">';
		if (i === boldedIndex) {
			content += "<strong>";
		}
		content += comment.text;
		content += '<span class="time-created" onclick="seekTo(' + comment.start_timecode + ');">';
		content += 'at ';
		content += '<a>';
		if (comment.start_timecode > 59) {
			content += Math.floor(comment.start_timecode / 60);
			content += ":";
			content += comment.start_timecode % 60;
		} else if (comment.start_timecode < 10) {
			content += "0:0" + comment.start_timecode;
		} else {
			content += "0:" + comment.start_timecode;
		}
		if (i === boldedIndex) {
			content += "</strong>";
		}
		content += '</a></span></div>';
	}
	$("#annotation-container").empty();
	$("#annotation-container").append(content);
}

function seekTo(time) {
	var endTime = document.getElementById("main-video").currentTime = time;
}