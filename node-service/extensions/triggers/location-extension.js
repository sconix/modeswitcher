/*
	Location Configuration Object:
	
	active:						integer,
	radius:						integer,
	latitude:					integer,
	longitude:					integer
	
	Location Status Object:
	
	activity:					integer,
	refresh:						integer,
	accuracy:					integer,
	location:					{
		lat:							string,
		lng:							string,
		acc:							integer
	},
	active:						[{
		lat:							string,
		lng:							string
	}]
	
*/

var locationTriggers = (function() {
	var that = {};
	
	var Foundations = IMPORTS.foundations;
	
	var PalmCall = Foundations.Comms.PalmCall;
	
	var Future = Foundations.Control.Future;
	
//
	
	var initExtension = function(config, triggers, accuracy, count) {
		var future = new Future();
		
		if(!accuracy)
			accuracy = 0;
		
		if(!count)
			count = 0;
		
		future.nest(PalmCall.call("palm://com.palm.location", "getCurrentPosition", {}));
		
		future.then(this, function(future) {
			var result = future.result;
			
			if((result.horizAccuracy == -1) || (result.horizAccuracy > config.accuracy))
				console.log("Insufficient accuracy: " + result.horizAccuracy);
			
			if((!future.exception) && (count < 20) && (accuracy < result.horizAccuracy)) {
				future.nest(initExtension(config, triggers, result.horizAccuracy, count + 1));
				
				future.then(this, function(future) {
					future.result = true;
				});
			}
			else {
				config.location = {
					lat: result.latitude, 
					lng: result.longitude, 
					acc: result.horizAccuracy};
				
				future.result = true;
			}
		});
		
		return future;
	};
	
//
	
	var addActivity = function(config) {
		var future = new Future();
		
		var startDate = new Date();
		
		startDate.setMinutes(startDate.getMinutes() + config.refresh);
		startDate.setSeconds(45);
		startDate.setMilliseconds(0);
		
		var startTime = convertDateToUtfStr(startDate);
		
		var newActivity = {
			"start" : true,
			"replace": true,
			"activity": {
				"name": "locationTrigger",
				"description" : "Location Check Trigger",
				"type": {"cancellable": true, "foreground": true, "persist": false},
				"schedule": {
					"precise": true,
					"start": startTime,
					"local": false, 
					"skip": true
				},
				"callback" : {
					"method" : "palm://org.e.lnx.wee.modeswitcher.srv/trigger",
					"params" : {"extension": "location"}
				}
			}
		};
		
		future.nest(PalmCall.call("palm://com.palm.activitymanager", "create", newActivity));
		
		future.then(this, function(future) {
			config.activity = future.result.activityId;
			
			future.result = true;
		});
		
		return future;
	};
	
	var delActivity = function(config) {
		var future = new Future();
		
		var oldActivity = {
			"activityId": config.activity
		};
		
		future.nest(PalmCall.call("palm://com.palm.activitymanager", "cancel", oldActivity));
		
		future.then(this, function(future) {
			config.activity = null;
			
			future.result = true;
		});
		
		return future;
	};
	
//
	
	var checkState = function(config, trigger) {
		if((trigger.latitude != -1) && 
			(trigger.longitude != -1))
		{
			var index = -1;
			
			for(var i = 0; i < config.active.length; i++) {
				if((config.active[i].lat == trigger.latitude) && 
					(config.active[i].lng == trigger.longitude))
				{
					index = i;
					break;
				}
			}
			
			if(((trigger.active == 0) && (index != -1)) || 
				((trigger.active == 1) && (index == -1)))
			{
				return true;
			}
		}
		
		return false;
	};
	
	var triggerState = function(config, trigger, args) {
		if((trigger.latitude != -1) && 
			(trigger.longitude != -1))
		{
			var time = calculateTimeEstimation(config, trigger);
			
			var index = -1;
			
			for(var i = 0; i < config.active.length; i++) {
				if((config.active[i].lat == trigger.latitude) && 
					(config.active[i].lng == trigger.longitude))
				{
					index = i;
					break;
				}
			}
			
			if(((time == 0) && (index == -1)) || ((time > 0) && (index != -1)))
				return true;
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
	
	var calculateTimeEstimation = function(config, trigger) {
		var lat1 = config.location.lat;
		var lng1 = config.location.lng;
		var lat2 = trigger.latitude;
		var lng2 = trigger.longitude;
		
		var radius = 6371; // in kilometers (change for miles)
		
		var diffLat = (lat2-lat1) * Math.PI / 180;
		var diffLng = (lng2-lng1) * Math.PI / 180;
		
		var tmp = Math.sin(diffLat/2) * Math.sin(diffLat/2) +
			Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
			Math.sin(diffLng/2) * Math.sin(diffLng/2);
		var tmp2 = 2 * Math.atan2(Math.sqrt(tmp), Math.sqrt(1-tmp));
		
		var distance = Math.round(radius * tmp2 * 1000);
		
//		console.log("Current coords: " + lat1 + " " + lng1);
//		console.log("Modes coords: " + lat2 + " " + lng2);
		
//		console.log("Location distance: " + distance);
		
//		console.log("Location accuracy: " + config.location.acc);
		
		// Reduce the radius - error from the distance.
		
		distance = distance - (trigger.radius - config.location.acc);
		
//		console.log("Location result: " + distance);
		
		// Currently static calculation for car speed.
		
		if(distance > 0) {
			var time = distance / (100 / 3,6);
			
			if(time < 5)
				time = 5;
			
			return time;
		}
		else
			return 0;
	};
	
//
	
	var updateRequiredAccuracy = function(config, triggers) {
		config.accuracy = 250;
		
		for(var i = 0; i < triggers.length; i++) {
			if((triggers[i].latitude != -1) && 
				(triggers[i].longitude != -1))
			{
				if(triggers[i].radius <= 250) {
					config.accuracy = 50;
					
					break;
				}
			}
		}
	};
	
	var updateLocationTracking = function(config, triggers) {
		config.refresh = 30;
		
		for(var i = 0; i < triggers.length ; i++) {
			if((triggers[i].latitude == -1) || 
				(triggers[i].longitude == -1))
			{
				continue;
			}
			
			var tmpTime = calculateTimeEstimation(config, triggers[i]);
			
			var index = -1;
			
			for(var j = 0; j < config.active.length; j++) {
				if((config.active[j].lat == triggers[i].latitude) && 
					(config.active[j].lng == triggers[i].longitude))
				{
					index = j;
					break;
				}
			}
			
			if(tmpTime == 0) {
				if(index == -1)
					config.active.push({lat: triggers[i].latitude, lng: triggers[i].longitude});
				
				config.refresh = 5; // If any trigger active then check time is 5 minutes.
			}
			else {
				if(index != -1)
					config.active.splice(index, 1);
				
				if(tmpTime < config.refresh)
					config.refresh = tmpTime;
			}
		}
		
		if(config.refresh < 5)
			config.refresh = 5;
	};
	
// Asynchronous public functions
	
	that.initialize = function(config, triggers) {
		config.activity = null;
		config.refresh = 5;		
		config.accuracy = 0;
		config.location = {lat: -1, lng: -1, acc: 0};
		config.active = [];
		
		var future = new Future();
		
		if(triggers.length == 0)
			future.result = { returnValue: true };
		else {
			updateRequiredAccuracy(config, triggers);
			
			future.nest(initExtension(config, triggers));
			
			future.then(this, function(future) {
				if((config.location.lat != -1) && 
					(config.location.lng != -1))
				{
					updateLocationTracking(config, triggers);
				}
				
				future.nest(addActivity(config));
				
				future.then(this, function(future) {
					future.result = { returnValue: true };
				});
			});
		}
		
		return future;	
	};
	
	that.shutdown = function(config) {
		config.refresh = 5;
		config.accuracy = 0;
		config.location = {lat: -1, lng: -1, acc: 0};
		config.active = [];
		
		var future = new Future();
		
		if(!config.activity)
			future.result = { returnValue: true };
		else {
			future.nest(delActivity(config));
			
			future.then(this, function(future) {
				future.result = { returnValue: true };
			});
		}
		
		return future;
	};
	
//
	
	that.reload = function(config, triggers, args) {
		config.activity = null;
		config.refresh = 5;		
		config.location = {lat: -1, lng: -1, acc: 0};
		
		var future = new Future();
		
		if(triggers.length == 0)
			future.result = { returnValue: true };
		else {
			updateRequiredAccuracy(config, triggers);
			
			future.nest(initExtension(config, triggers));
			
			future.then(this, function(future) {
				if((config.location.lat != -1) && 
					(config.location.lng != -1))
				{
					updateLocationTracking(config, triggers);
				}
				
				future.nest(addActivity(config));
				
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
