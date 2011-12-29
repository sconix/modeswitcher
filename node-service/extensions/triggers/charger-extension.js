/*
	Charger Configuration Object:
	
	charger:					string,
	orientation:			integer
	
	Charger Status Object:
	
	activity:				integer,
	state:					string,
	orientation:			string
*/

var chargerTriggers = (function() {
	var that = {};
	
	var Foundations = IMPORTS.foundations;
	
	var PalmCall = Foundations.Comms.PalmCall;
	
	var Future = Foundations.Control.Future;
	
//
	
	var initExtension = function(config) {
		var future = new Future();
		
		future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
			'id': "com.palm.systemservice", 'service': "com.palm.systemservice", 
			'method': "getPreferences", 'params': {'keys': ["chargerStatus"]}}));
		
		future.then(this, function(future) {
			if(future.result.chargerStatus) {
				if(future.result.chargerStatus.state)
					config.state = future.result.chargerStatus.state;
				else
					config.state = "none";
				
				if((config.state != "none") && (future.result.chargerStatus.orientation))
					config.orientation = future.result.chargerStatus.orientation;
				else
					config.orientation = "any";
			}
			
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
				"name": "chargerTrigger",
				"description" : "Charger Status Notifier",
				"type": {"cancellable": true, "foreground": true, "persist": false},
				"trigger" : {
					"method" : "palm://com.palm.systemservice/getPreferences",
					"params" : {"subscribe": true, "keys": ["chargerStatus"]}
				},
				"callback" : {
					"method" : "palm://org.e.lnx.wee.modeswitcher.srv/trigger",
					"params" : {"extension": "charger"}
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
		if((config.state == trigger.charger) && ((config.orientation == "any") ||
			(trigger.orientation == "any") || (config.orientation == trigger.orientation)))
		{
			return true;
		}
		
		return false;
	};
	
	var triggerState = function(config, trigger, args) {
		if((args.$activity) && (args.$activity.trigger) &&
			(args.$activity.trigger.chargerStatus))
		{
			if(((config.state == "none") && 
				(args.$activity.trigger.chargerStatus.state != "none") && 
				((trigger.charger == "none") ||
				(args.$activity.trigger.chargerStatus.state == trigger.charger)) && 
				((trigger.orientation == "any") || 
				(args.$activity.trigger.chargerStatus.orientation == trigger.orientation))) || 
				((config.state != "none") && 
				(args.$activity.trigger.chargerStatus.state == "none") && 
				((trigger.charger == "none") ||
				(config.state == trigger.charger)) && 
				((config.orientation == "any") || (trigger.orientation == "any") || 
				(config.orientation == trigger.orientation))))
			{
				return true;
			}
		}
		
		return false;
	};
	
// Asynchronous public functions
	
	that.initialize = function(config, triggers) {
		config.activity = null;
		config.state = "none";
		config.orientation = "unknown";
		
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
		config.state = "none";
		config.orientation = "unknown";
		
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
		config.current = 0;
		
		var future = new Future();
		
		if((triggers.length == 0) ||
			(!args.$activity) || (!args.$activity.trigger) || 
			(args.$activity.trigger.returnValue == false))
		{
			future.result = { returnValue: true };
		}
		else {
			if(args.$activity.trigger.chargerStatus != undefined) {
				if(args.$activity.trigger.chargerStatus.state)
					config.state = args.$activity.trigger.chargerStatus.state;
				else
					config.state = "none";
				
				if(args.$activity.trigger.chargerStatus.orientation)
					config.orientation = args.$activity.trigger.chargerStatus.orientation;
				else
					config.orientation = "any";
			}
			
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
