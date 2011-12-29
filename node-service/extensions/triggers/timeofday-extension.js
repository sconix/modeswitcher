/*
	Timeofday Configuration Object:
	
	startTime:			integer,
	closeTime:			integer,
	activeDays:			integer,
	customDays:			[boolean]
	
	Timeofday Status Object:
	
	activities:			[integer]
*/

var timeofdayTriggers = (function() {
	var that = {};
	
	var Foundations = IMPORTS.foundations;
	
	var PalmCall = Foundations.Comms.PalmCall;
	
	var Future = Foundations.Control.Future;
	
//
	
	var addActivities = function(config, triggers, index) {
		var future = new Future();
		
		if(index < triggers.length) {
			var trigger = triggers[index];
			
			var limits = getTimeOfDayLimits(trigger, false);
			
			var startTime = convertDateToUtfStr(limits.startTime);
			var closeTime = convertDateToUtfStr(limits.closeTime);
			
			var newStartActivity = {
				"start" : true,
				"replace": true,
				"activity": {
					"name": "timeoutTrigger" + limits.startTime.getTime(),
					"description" : "Timeout Event Notifier",
					"type": {"cancellable": true, "foreground": true, "persist": false},
					"schedule" : { 
						"start" : startTime,
						"local" : false,
						"skip" : true
					},
					"callback" : {
						"method" : "palm://org.e.lnx.wee.modeswitcher.srv/trigger",
						"params" : {"extension": "timeofday", 
							"timestamp": limits.startTime.getTime()}
					}
				}
			};
			
			var newCloseActivity = {
				"start" : true,
				"replace": true,
				"activity": {
					"name": "timeoutTrigger" + limits.closeTime.getTime(),
					"description" : "Timeout Event Notifier",
					"type": {"cancellable": true, "foreground": true, "persist": false},
					"schedule" : { 
						"start" : closeTime,
						"local" : false,
						"skip" : true
					},
					"callback" : {
						"method" : "palm://org.e.lnx.wee.modeswitcher.srv/trigger",
						"params" : {"extension": "timeofday", 
							"timestamp": limits.closeTime.getTime()}
					}
				}
			};
			
	//		console.log("Alarm for timeofday start: " + startTime);
	//		console.log("Alarm for timeofday close: " + closeTime);
			
			future.nest(PalmCall.call("palm://com.palm.activitymanager", "create", newStartActivity));
			
			future.then(this, function(future) {
				config.activities.push(future.result.activityId);
				
				future.nest(PalmCall.call("palm://com.palm.activitymanager", "create", newCloseActivity));
				
				future.then(this, function(future) {
					config.activities.push(future.result.activityId);
					
					future.nest(addActivities(config, triggers, index + 1));
					
					future.then(this, function(future) {
						future.result = true;
					});
				});
			});
		}
		else
			future.result = true;
		
		return future;
	};
	
	var delActivities = function(config, index) {
		var future = new Future();
		
		if(index < config.activities.length) {
			var oldActivity = {
				"activityId": config.activities[index]
			};
			
			future.nest(PalmCall.call("palm://com.palm.activitymanager", "cancel", oldActivity));
			
			future.then(this, function(future) {
				future.nest(delActivities(config, index + 1));
				
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
		var limits = getTimeOfDayLimits(trigger, true);
		
		if((limits.curTime.getTime() >= limits.startTime.getTime()) && 
			(limits.curTime.getTime() < limits.closeTime.getTime()))
		{
			return true;
		}
		
		return false;
	};
	
	var triggerState = function(config, trigger, args) {
		var current = getTimeOfDayLimits(trigger, true);
		
		if(args.timestamp) {
			if(((current.startTime.getTime()) == args.timestamp) ||
				((current.closeTime.getTime()) == args.timestamp))
			{
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
	
	var getTimeOfDayLimits = function(trigger, current) {
		// Returns current time limits with correct day information. 
		// We cannot trust the date information stored in the trigger
		// so we need to figure out the correct dates for the limits.
		
		var curTime = new Date();
		var startTime = new Date(trigger.startTime);
		var closeTime = new Date(trigger.closeTime);
		
		curTime.setSeconds(0); curTime.setMilliseconds(0);
		
		// Hours, Minutes, Seconds and Milliseconds should be correct (set in editmode).
		
		startTime.setFullYear(curTime.getFullYear(), curTime.getMonth(), curTime.getDate());
		closeTime.setFullYear(curTime.getFullYear(), curTime.getMonth(), curTime.getDate());
		
		// Check that if startTime has actually gone that is the current day correct.
		
		if(startTime.getTime() > curTime.getTime()) {
			if(closeTime.getTime() >= curTime.getTime()) {
				startTime.setDate(startTime.getDate() - 1);
				closeTime.setDate(closeTime.getDate() - 1);
			}
		}
		
		// If set to be active whole day then move the start and close time to be correct.
		
		if(startTime.getTime() == closeTime.getTime()) {
			startTime.setDate(startTime.getDate() - 1);
			closeTime.setDate(closeTime.getDate() - 1);
		}
		
		// First check if closeTime is set for the following day (closeTime before startTime).
		
		if(startTime.getTime() >= closeTime.getTime())
			closeTime.setDate(closeTime.getDate() + 1);
		
		// Move the startTime / closeTime for the next day if closeTime is already past.
		
		if(closeTime.getTime() < curTime.getTime()) {
			startTime.setDate(startTime.getDate() + 1);
			closeTime.setDate(closeTime.getDate() + 1);
		}
		
		// Fix the startTime / closeTime according to the setup (workdays / weekends).
		
		if(trigger.activeDays == 1) {
			if(startTime.getDay() == 0) {
				startTime.setDate(startTime.getDate() + 1);
				closeTime.setDate(closeTime.getDate() + 1);
			}
			else if(startTime.getDay() == 6) {
				startTime.setDate(startTime.getDate() + 2);
				closeTime.setDate(closeTime.getDate() + 2);
			}
			
			// If set to be active full 24 hours then move the closeTime to be correct.
			
			if(startTime.getTime() == closeTime.getTime()) {
				closeTime.setDate(closeTime.getDate() + (6 - closeTime.getDay()));
			}
		}
		else if(trigger.activeDays == 2) {
			if((startTime.getDay() >= 1) && (startTime.getDay() <= 5)) {
				var days = 6 - startTime.getDay();
				
				startTime.setDate(startTime.getDate() + days);
				closeTime.setDate(closeTime.getDate() + days);
			}
			
			// If set to be active full 24 hours then move the closeTime to be correct.
			
			if(startTime.getTime() == closeTime.getTime()) {
				if(closeTime.getDay() == 0) {
					closeTime.setDate(closeTime.getDate() + 1);
				}
				else if(closeTime.getDay() == 6) {
					closeTime.setDate(closeTime.getDate() + 2);
				}
			}
		}
		else if(trigger.activeDays == 3) {
			for(var i = 0; i < 7; i++) {
				if(trigger.customDays[startTime.getDay()] != true) {
					startTime.setDate(startTime.getDate() + 1);
					closeTime.setDate(closeTime.getDate() + 1);
				}
				else {
					// If set to be active full 24 hours then move the closeTime to be correct.
					
					if(startTime.getTime() == closeTime.getTime()) {
						for(var j = 0; j < 7; j++) {
							if(trigger.customDays[closeTime.getDay()] == true) {
								closeTime.setDate(closeTime.getDate() + 1);
							}
							else {
								break;
							}
						}
					}
					
					break;
				}
			}
		}
		
		if(!current) {
			// Moves start and close limits for the next possible time 
			
			if(startTime.getTime() <= curTime.getTime())
				startTime.setDate(startTime.getDate() + 1);
			
			if(closeTime.getTime() <= curTime.getTime())
				closeTime.setDate(closeTime.getDate() + 1);
			
			if(trigger.activeDays == 1) {
				if(startTime.getDay() == 0) {
					startTime.setDate(startTime.getDate() + 1);
					closeTime.setDate(closeTime.getDate() + 1);
				}
				else if(startTime.getDay() == 6) {
					startTime.setDate(startTime.getDate() + 2);
					closeTime.setDate(closeTime.getDate() + 2);
				}	
			}
			
			else if(trigger.activeDays == 2) {
				if((startTime.getDay() >= 1) && (startTime.getDay() <= 5)) {
					startTime.setDate(startTime.getDate() + (6 - startTime.getDay()));
					closeTime.setDate(closeTime.getDate() + (6 - closeTime.getDay()));
				}
			}
			
			else if(trigger.activeDays == 3) {
				for(var i = 0; i < 7; i++) {
					if(trigger.customDays[startTime.getDay()] != true) {
						startTime.setDate(startTime.getDate() + 1);
						closeTime.setDate(closeTime.getDate() + 1);
					}
					else {
						break;
					}
				}
			}
		}
		
		console.error("From time: " + startTime.getHours() + ":" + startTime.getMinutes() + " " + startTime.getDate() + "/" + (startTime.getMonth() + 1) + "/" + startTime.getFullYear() + ", To Time: " + closeTime.getHours() + ":" + closeTime.getMinutes() + " " + closeTime.getDate() + "/" + (closeTime.getMonth() + 1) + "/" + closeTime.getFullYear());
		
		console.error("From timestamp: " + startTime.getTime() + ", To timestamp: " + closeTime.getTime());
		
		return {"curTime": curTime, "startTime": startTime, "closeTime": closeTime};
	}
	
// Asynchronous public functions
	
	that.initialize = function(config, triggers) {
		config.activities = [];
		
		var future = new Future(triggers.length - 1);
		
		if(triggers.length == 0)
			future.result = { returnValue: true };
		else {
			future.nest(addActivities(config, triggers, 0));
			
			future.then(this, function(future) {
				future.result = { returnValue: true };
			});
		}
		
		return future;
	};
	
	that.shutdown = function(config) {
		var future = new Future(config.activities.length - 1);
		
		if(config.activities.length == 0)
			future.result = { returnValue: true };
		else {
			future.nest(delActivities(config, 0));
			
			future.then(this, function(future) {
				config.activities = [];
				
				future.result = { returnValue: true };
			});
		}
		
		return future;
	};
	
//
	
	that.reload = function(config, triggers, args) {
		config.activities = [];
		
		var future = new Future(triggers.length - 1);
		
		if((triggers.length == 0) || 
			(!args.timestamp) || (!args.$activity))
		{
			future.result = { returnValue: true };
		}
		else {
			future.nest(addActivities(config, triggers, 0));
			
			future.then(this, function(future) {
				future.result = { returnValue: true };
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
