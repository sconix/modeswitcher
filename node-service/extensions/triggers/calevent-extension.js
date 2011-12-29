/*
	Calevent Configuration Object:
	
	calendar:				string,
	matchMode:				string,
	matchText:				string
	
	Calevent Status Object:
	
	activities:				[integer],
	revision:				integer,
	update:					string,
	events:					[{
		eventId:					string,
		calendarId:				string,
		subject:					string,
		location:				string,
		note:						string,
		start:					integer,
		close:					integer
	}]
*/

var caleventTriggers = (function() {
	var that = {};
	
	var Foundations = IMPORTS.foundations;
	
	var PalmCall = Foundations.Comms.PalmCall;
	
	var Future = Foundations.Control.Future;
	
//
	
	var initExtension = function(config, triggers, validEvents, parentIds, page) {
		var future = new Future();
		
		if(!page) {
			future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
				'id': "com.palm.app.calendar", 'service': "com.palm.db", 
				'method': "find", 'params': {'query': {'from': "com.palm.calendarevent:1"}}})); 
		}
		else {
			future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
				'id': "com.palm.app.calendar", 'service': "com.palm.db", 
				'method': "find", 'params': {'query': {'from': "com.palm.calendarevent:1", 'page': page}}}));
		}
		
		if(!validEvents)
			validEvents = [];
		
		if(!parentIds)
			parentIds = [];
		
		future.then(this, function(future) {
			var result = future.result;
			
			for(var i = 0; i < result.results.length; i++) {
				if(result.results[i]._rev > config.revision)
					config.revision = result.results[i]._rev;
				
				for(var j = 0; j < triggers.length; j++) {
					if(checkIfEventIsValid(result.results[i], triggers[j])) {
						var eventInfo = getCurrentDayEventInfo(result.results[i], parentIds);
						if((eventInfo) && (eventInfo.start)) {
							var index = utils.findArray(validEvents, "timestamp", eventInfo.start);
							
							if(index == -1)
								validEvents.push({'timestamp': eventInfo.start, 'events': [eventInfo]});
							else
								validEvents[index].events.push(eventInfo);
						}
						
						if((eventInfo) && (eventInfo.close)) {
							var index = utils.findArray(validEvents, "timestamp", eventInfo.close);
							
							if(index == -1)
								validEvents.push({'timestamp': eventInfo.close, 'events': [eventInfo]});
							else
								validEvents[index].events.push(eventInfo);
						}
					}
				}
			}
			
			if(result.next) {
				future.nest(initExtension(config, triggers, validEvents, parentIds, result.next));
					
				future.then(this, function(future) {
					future.result = { events: validEvents, parentIds: parentIds };
				});
			}
			else
				future.result = { events: validEvents, parentIds: parentIds };
		});
		
		return future;
	};
	
//
	
	var addActivity = function(config) {
		var future = new Future();
		
		var date = new Date();
		
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		
		date.setDate(date.getDate() + 1);
		date.setSeconds(date.getSeconds() - 30);
		
		var updateTime = convertDateToUtfStr(date);
		
		var newUpdateActivity = {
			"start" : true,
			"replace": true,
			"activity": {
				"name": "caleventEventsTrigger",
				"description" : "Calendar Update Notifier",
				"type": {"foreground": true, "persist": false},
				"trigger" : {
					"key" : "fired",
					"method": "palm://com.palm.db/watch", 
					"params": { 
						"query": { 
							"from": "com.palm.calendarevent:1", 
							"where": [ 
								{ "prop": "_rev", "op": ">", "val": config.revision }
							],
							"incDel": true
						} 
					} 
				},
				"callback" : {
					"method" : "palm://org.e.lnx.wee.modeswitcher.srv/trigger",
					"params" : {"extension": "calevent", "event": "update"}
				}
			}
		};
		
		var newRefreshActivity = {
			"start" : true,
			"replace": true,
			"activity": {
				"name": "caleventUpdateTrigger",
				"description" : "Calendar Refresh Notifier",
				"type": {"foreground": true, "persist": false},
				"schedule" : { 
					"start" : updateTime,
					"local" : false,
					"skip" : true
				},
				"callback" : {
					"method" : "palm://org.e.lnx.wee.modeswitcher.srv/trigger",
					"params" : {"extension": "calevent", "event": "refresh"}
				}
			}
		};
		
		future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
			'id': "com.palm.app.calendar", 'service': "com.palm.activitymanager", 
			'method': "create", 'params': newUpdateActivity}));
		
		future.then(this, function(future) {
			config.activities.push(future.result.activityId);
			
			future.nest(PalmCall.call("palm://com.palm.activitymanager", "create", newRefreshActivity));
			
			future.then(this, function(future) {
				config.activities.push(future.result.activityId);
				
				future.result = true;
			});
		});
		
		return future;
	};
	
//
	
	var addActivities = function(config, events, parentIds, index) {
		var future = new Future();
		
		if(index < events.length) {
			var eventData = events[index];
			
			if(parentIds.indexOf(eventData.eventId) == -1) {
				var date = new Date(eventData.timestamp);
				
				var startTime = convertDateToUtfStr(date);
				
				var newActivity = {
					"start" : true,
					"replace": true,
					"activity": {
						"name": "caleventEventTrigger" + eventData.timestamp,
						"description" : "Calendar Event Notifier",
						"type": {"cancellable": true, "foreground": true, "persist": false},
						"schedule" : { 
							"start" : startTime,
							"local" : false,
							"skip" : false
						},
						"callback" : {
							"method" : "palm://org.e.lnx.wee.modeswitcher.srv/trigger",
							"params" : {"extension": "calevent", "events": eventData.events, 
								"timestamp": eventData.timestamp}
						}
					}
				};
				
				console.error("Added calendar event trigger: " + startTime);
				
				future.nest(PalmCall.call("palm://com.palm.activitymanager", "create", newActivity));
				
				future.then(this, function(future) {
					config.activities.push(future.result.activityId);
					
					future.nest(addActivities(config, events, parentIds, index + 1));
					
					future.then(this, function(future) {
						future.result = true;
					});
				});
			}
			else {
				future.nest(addActivities(config, events, parentIds, index + 1));
				
				future.then(this, function(future) {
					future.result = true;
				});
			}
		}
		else
			future.result = true;
		
		return future;
	};
	
	var delActivities = function(config, skip, index) {
		var future = new Future();
		
		if(index < config.activities.length) {
			var oldActivity = {
				"activityId": config.activities[index]
			};
			
			if((index == 0) && (!skip)) {
				future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
					'id': "com.palm.app.calendar", 'service': "com.palm.activitymanager", 
					'method': "cancel", 'params': oldActivity})); 
			}
			else {
				future.nest(PalmCall.call("palm://com.palm.activitymanager", "cancel", oldActivity));
			}
			
			future.then(this, function(future) { 
				future.nest(delActivities(config, skip, index + 1));
				
				future.then(this, function(future) {
					future.result = true;
				});
			});
		}
		else
			future.result = true;
		
		return future;
	};
	
//
	
	var checkState = function(config, trigger) {
		for(var i = 0; i < config.events.length; i++) {
			if(checkIfEventIsValid(config.events[i], trigger))
				return true;
		}
		
		return false;
	};
	
	var triggerState = function(config, trigger, args) {
		if((args.event == "update") || (args.event == "refresh"))
			return false;
		
		if(args.events) {
			for(var i = 0; i < args.events.length; i++) {
				if(checkIfEventIsValid(args.events[i], trigger))
					return true;
			}
		}
		
		return false;
	};
	
//
	
	var convertDateToUtfStr = function(date) {
		var day = date.getUTCDate();
		if(day < 10) day = "0" + day;
		var month = date.getUTCMonth()+1;
		if(month < 10) month = "0" + month;
		var year = date.getUTCFullYear();
		
		var hours = date.getUTCHours();
		if(hours < 10) hours = "0" + hours;
		var minutes = date.getUTCMinutes();
		if(minutes < 10) minutes = "0" + minutes;
		
		var seconds = date.getUTCSeconds();
		if(seconds < 10) seconds = "0" + seconds;
		
		var str = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
		
		return str;
	};
	
	var checkIfEventIsValid = function(event, trigger) {
		var text = trigger.matchText;
		
		if(text.length > 0)
			var regexp = new RegExp("/*" + text + "*", "i");
		
		if((trigger.calendar != "any") && (trigger.calendar != event.calendarId))
			return false;
		
		if(((trigger.matchMode == "match") && ((text.length == 0) || 
			((event.subject) && (event.subject.match(regexp) != null)) || 
			((event.location) && (event.location.match(regexp) != null)) || 
			((event.note) && (event.note.match(regexp) != null)))) ||
			((trigger.matchMode == "nomatch") && (text.length > 0) && 
			((((!event.subject) || (event.subject.match(regexp) == null)) && 
			((!event.location) || (event.location.match(regexp) == null)) && 
			((!event.note) || (event.note.match(regexp) == null))))))
		{
			return true;
		}
		
		return false;
	};
	
	var getCurrentDayEventInfo = function(event, parentIds) {
		var start = new Date(event.dtstart);
		var close = new Date(event.dtend);
		
		if((isNaN(start.getTime())) || (isNaN(close.getTime())))
			return null;
		
		var date = new Date();
		
		date.setSeconds(15);
		date.setMilliseconds(0);
		
		var limit = new Date();
		
		limit.setHours(0);
		limit.setMinutes(0);
		limit.setSeconds(0);
		limit.setMilliseconds(0);
		
		limit.setDate(limit.getDate() + 1);
		
		if(event.rrule) {
			var interval = 1;
			
			if(event.rrule.interval)
				interval = event.rrule.interval;
			
			if(event.rrule.freq == "DAILY") {
				while(start.getTime() < date.getTime()) {
					start.setDate(start.getDate() + interval);
					close.setDate(close.getDate() + interval);
				}
			}
			else if(event.rrule.freq == "WEEKLY") {
				if((!event.rrule.rules) || (event.rrule.rules.length == 0)) {
					while(start.getTime() < date.getTime()) {
						start.setDate(start.getDate() + (interval * 7));
						close.setDate(close.getDate() + (interval * 7));
					}
				}
				else {
					for(var i = 0; i < event.rrule.rules.length; i++) {
						if(event.rrule.rules[i].ruleType == "BYDAY") {
							for(var j = 0; j < event.rrule.rules[i].ruleValue.length; j++) {
								if(event.rrule.rules[i].ruleValue[j].day == date.getDay()) {
									var difference = 0;
								
									if(start.getDay() < date.getDay())
										difference = 0 - start.getDay() + date.getDay();
									else if(start.getDay() > date.getDay())
										difference = 7 - start.getDay() + date.getDay();
									
									start.setDate(start.getDate() + difference);
									close.setDate(close.getDate() + difference);
									
									while(start.getTime() < date.getTime()) {
										start.setDate(start.getDate() + (interval * 7));
										close.setDate(close.getDate() + (interval * 7));
									}
									
									break;
								}
							}
						}
					}
				}
			}
			else if(event.rrule.freq == "MONTHLY") {
				if((!event.rrule.rules) || (event.rrule.rules.length == 0)) {
					while(start.getTime() < date.getTime()) {
						start.setMonth(start.getMonth() + interval);
						close.setMonth(close.getMonth() + interval);
					}
				}
				else {
					for(var i = 0; i < event.rrule.rules.length; i++) {
						if(event.rrule.rules[i].ruleType == "BYDAY") {
							for(var j = 0; j < event.rrule.rules[i].ruleValue.length; j++) {
								if(event.rrule.rules[i].ruleValue[j].day == date.getDay()) {
									var ordCount = 0;
									var intervalCount = 0;
									
									while(start.getTime() < date.getTime()) {
										while(ordCount < (event.rrule.rules[i].ruleValue[j].ord || 1)) {
											if(start.getTime() >= (date.getTime() + 86400000))
												break;
											
											var month = start.getMonth();
											
											start.setDate(start.getDate() + 7);
											close.setDate(close.getDate() + 7);
											
											if(month != start.getMonth()) {
												ordCount = 0;
												intervalCount++;
											}
											
											if((intervalCount > 0 ) && ((intervalCount % interval) == 0))
												ordCount++;
										}
									}
									
									break;
								}
							}
						}
						else if(event.rrule.rules[i].ruleType == "BYMONTHDAY") {
							for(var j = 0; j < event.rrule.rules[i].ruleValue.length; j++) {
								if((event.rrule.rules[i].ruleValue[j].ord || 1) == date.getDate()) {
									while(start.getTime() < date.getTime()) {
										start.setMonth(start.getMonth() + interval);
										close.setMonth(close.getMonth() + interval);
									}
									
									break;
								}
							}
						}
					}
				}
			}
			else if(event.rrule.freq == "YEARLY") {
				while(start.getTime() < date.getTime()) {
					start.setYear(start.getYear() + interval);
					close.setYear(close.getYear() + interval);
				}
			}
			
			var exDateString = "";
			
			exDateString += start.getFullYear();
			
			if((start.getMonth() + 1) < 10) exDateString += "0";
			exDateString += (start.getMonth() + 1);
			if(start.getDate() < 10) exDateString += "0";
			exDateString += start.getDate() + "T";
			if(start.getHours() < 10) exDateString += "0";
			exDateString += start.getHours();
			if(start.getMinutes() < 10) exDateString += "0";
			exDateString += start.getMinutes();
			if(start.getSeconds() < 10) exDateString += "0";
			exDateString += start.getSeconds();
			
			var exDateStringUTC = "";
			
			exDateStringUTC += start.getUTCFullYear();
			
			if((start.getUTCMonth() + 1) < 10) exDateStringUTC += "0";
			exDateStringUTC += (start.getUTCMonth() + 1);
			if(start.getUTCDate() < 10) exDateStringUTC += "0";
			exDateStringUTC += start.getUTCDate() + "T";
			if(start.getUTCHours() < 10) exDateStringUTC += "0";
			exDateStringUTC += start.getUTCHours();
			if(start.getUTCMinutes() < 10) exDateStringUTC += "0";
			exDateStringUTC += start.getUTCMinutes();
			if(start.getUTCSeconds() < 10) exDateStringUTC += "0";
			exDateStringUTC += start.getUTCSeconds();
			exDateStringUTC += "Z";
		}
		
		var startTime = start.getTime();
		var closeTime = close.getTime();
		
		if(((event.rrule) && (!event.rrule.until) &&
			(start.getTime() >= event.rrule.until)) ||
			((event.rrule) && (event.exdates) &&
			((event.exdates.indexOf(exDateString) != -1) ||
			(event.exdates.indexOf(exDateStringUTC) != -1))))
		{
			startTime = null;
			closeTime = null;
		}
		else {
			if((start.getTime() < date.getTime()) || (start.getTime() >= limit.getTime()))
				startTime = null;
			
			if((close.getTime() < date.getTime()) || (close.getTime() >= limit.getTime()))
				closeTime = null;
			
			if((event.parentId) && ((startTime != null) || (closeTime != null)))
				parentIds.push(event.parentId);
		}
		
		var eventInfo = {
			'eventId': event._id, 
			'calendarId': event.calendarId, 
			'subject': event.subject, 
			'location': event.location, 
			'note': event.note, 
			'start': startTime, 
			'close': closeTime
		};
		
		return eventInfo;
	};
	
// Asynchronous public functions
	
	that.initialize = function(config, triggers) {
		config.activities = [];
		config.revision = 0;
		config.events = [];
		
		var future = new Future();
		
		if(triggers.length == 0)
			future.result = { returnValue: true };
		else {
			future.nest(initExtension(config, triggers));
			
			future.then(this, function(future) {
				var events = future.result.events;
				var parentIds = future.result.parentIds;
				
				future.nest(addActivity(config));
				
				future.then(this, function(future) {
					if(events.length == 0)
						future.result = { returnValue: true };
					else {
						future.nest(addActivities(config, events, parentIds, 0));
						
						future.then(this, function(future) {
							future.result = { returnValue: true };
						});
					}
				});
			});
		}
		
		return future;
	};
	
	that.shutdown = function(config, skip) {
		config.revision = 0;
		config.events = [];
		
		if(skip == undefined)
			skip = false;
		
		var future = new Future(config.activities.length - 1);
		
		if((!config.activities) || (config.activities.length == 0))
			future.result = { returnValue: true };
		else {
			future.nest(delActivities(config, skip, 0));
			
			future.then(this, function(future) {
				config.activities = [];
				
				future.result = { returnValue: true };
			});
		}
		
		return future;
	};
	
//
	
	that.reload = function(config, triggers, args) {
		var future = new Future();
		
		if((triggers.length == 0) ||
			(!args.$activity) || ((args.$activity.trigger) && 
			(args.$activity.trigger.returnValue == false)) || 
			((!args.event) && ((!args.events) || (!args.timestamp))))
		{
			future.result = { returnValue: true };
		}
		else if(args.events) {
			var index = config.activities.indexOf(args.$activity.activityId);
			
			if(index != -1)
				config.activities.splice(index, 1);
			
			for(var i = 0; i < args.events.length; i++) {
				if((args.events[i].start) && 
					(args.timestamp == args.events[i].start))
				{
					var index = utils.findArray(config.events, "eventId", args.events[i].eventId);
					
					if(index == -1)
						config.events.push(args.events[i]);
				}
				
				if((args.events[i].close) && 
					(args.timestamp == args.events[i].close))
				{
					var index = utils.findArray(config.events, "eventId", args.events[i].eventId);
					
					if(index != -1)
						config.events.splice(index, 1);
				}
			}
			
			future.result = { returnValue: true };
		}
		else {
			// Easier to do full reload than check which event activities 
			// should be canceled and which event activities created.
			
			var index = config.activities.indexOf(args.$activity.activityId);
			
			if(index != -1)
				config.activities.splice(index, 1);
			
			if(args.event == "update")
				future.nest(that.shutdown(config, true));
			else
				future.nest(that.shutdown(config, false));
			
			future.then(this, function(future) {
				future.nest(that.initialize(config, triggers));
				
				future.then(this, function(future) {
					future.result = { returnValue: true };
				});
			});
		}
		
		return future;
	};
	
// Synchronous public functions
	
	that.check = function(config, trigger) {
		return checkState(config, trigger);
	};
	
	that.trigger = function(config, trigger, args) {
		return triggerState(config, trigger, args);
	};
	
	return that;
}());
