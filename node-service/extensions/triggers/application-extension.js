/*
	Application Configuration Object:
	
	appId:				string,
	appState:			integer
	
	Application Status Object:
	
	activity:			integer,
	appId:				string
*/

var applicationTriggers = (function() {
	var that = {};
	
	var Foundations = IMPORTS.foundations;
	
	var PalmCall = Foundations.Comms.PalmCall;
	
	var Future = Foundations.Control.Future;
	
//
	
	var initExtension = function(config) {
		var future = new Future();
		
		future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
			'id': "com.palm.systemmanager", 'service': "com.palm.systemmanager", 
			'method': "getForegroundApplication", 'params': {}}));
		
		future.then(this, function(future) {
			if(future.result.id)
				config.appId = future.result.id;
			else
				config.appId = "none";
			
			future.result = true;
		});
		
		return future;
	};
	
//
	
	var addActivity = function(config) {
		var future = new Future();
		
		var newActivity = {
			"start" : true,
			"replace": true,
			"activity": {
				"name": "applicationTrigger",
				"description" : "Foreground Application Notifier",
				"type": {"cancellable": true, "foreground": true, "persist": false},
				"trigger" : {
					"method" : "palm://com.palm.systemmanager/getForegroundApplication",
					"params" : {"subscribe": true}
				},
				"callback" : {
					"method" : "palm://org.e.lnx.wee.modeswitcher.srv/trigger",
					"params" : {"extension": "application"}
				}
			}
		};
		
		future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
			'id': "com.palm.activitymanager", 'service': "com.palm.activitymanager", 
			'method': "create", 'params': newActivity}));
		
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
		
		future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
			'id': "com.palm.activitymanager", 'service': "com.palm.activitymanager", 
			'method': "cancel", 'params': oldActivity}));
		
		future.then(this, function(future) {
			config.activity = null;
			
			future.result = true;
		});
		
		return future;
	};
	
//
	
	var checkState = function(config, trigger) {
		if(config.appId == "unknown")
			return false;
		
		if((trigger.appState == 0) && (config.appId == trigger.appId))
			return true;
		
		if((trigger.appState == 1) && (config.appId != trigger.appId))
			return true;
		
		return false;
	};
	
	var triggerState = function(config, trigger, args) {
		var appId = "none";
		
		if((args.$activity) && (args.$activity.trigger)) {
			if(args.$activity.trigger.id != undefined)
				appId = args.$activity.trigger.id;
			
			if(config.appId != appId)
				return true;
		}
		
		return false;
	};
	
// Asynchronous public functions
	
	that.initialize = function(config, triggers) {
		config.activity = null;
		config.appId = "unknown";
		
		var future = new Future();
		
		if(triggers.length == 0)
			future.result = { returnValue: true };
		else {
			future.nest(initExtension(config));
			
			future.then(this, function(future) {
				future.nest(addActivity(config));
				
				future.then(this, function(future) {
					future.result = { returnValue: true };
				});
			});
		}
		
		return future;
	};
	
	that.shutdown = function(config) {
		config.appId = "unknown";
		
		var future = new Future();
		
		if(!config.activity)
			future.result = { returnValue: true };
		else {
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
		config.appId = "unknown";
		
		var future = new Future();
		
		if((triggers.length == 0) ||
			(!args.$activity) || (!args.$activity.trigger) || 
			(args.$activity.trigger.returnValue == false))
		{
			future.result = { returnValue: true };
		}
		else {
			if(args.$activity.trigger.id != undefined)
				config.appId = args.$activity.trigger.id;
			else
				config.appId = "none";
			
			future.nest(addActivity(config));
			
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
