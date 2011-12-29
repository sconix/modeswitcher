/*
	Wireless Configuration Object:
	
	state:					integer,
	ssid:						string
	
	Wireless Status Object:
	
	activity:				integer,
	state:					string,
	ssid:						string
*/

var wirelessTriggers = (function() {
	var that = {};
	
	var Foundations = IMPORTS.foundations;
	
	var PalmCall = Foundations.Comms.PalmCall;
	
	var Future = Foundations.Control.Future;
	
//
	
	var initExtension = function(config) {
		var future = new Future();
		
		future.nest(PalmCall.call("palm://com.palm.connectionmanager", "getstatus", {}));
		
		future.then(this, function(future) {
			if(future.result.wifi) {
				if(future.result.wifi.state == "connected")
					config.state = "connected";
				else
					config.state = "disconnected";
				
				if(future.result.wifi.ssid)
					config.ssid = future.result.wifi.ssid.toLowerCase();
				else
					config.ssid = "none";
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
				"name": "wirelessTrigger",
				"description" : "Wireless Network Notifier",
				"type": {"cancellable": true, "foreground": true, "persist": false},
				"trigger" : {
					"method" : "palm://com.palm.connectionmanager/getstatus",
					"params" : {'subscribe': true}
				},
				"callback" : {
					"method" : "palm://org.e.lnx.wee.modeswitcher.srv/trigger",
					"params" : {"extension": "wireless"}
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
		if(config.state == "unknown")
			return false;
		else if(config.state == "connected") {
			if(trigger.state == 0)
				return true;
			
			if((trigger.state == 2) && (config.ssid == trigger.ssid.toLowerCase()))
				return true;
			
			if((trigger.state == 3) && (config.ssid != trigger.ssid.toLowerCase()))
				return true;
		}
		else if(config.state == "disconnected") {	
			if((trigger.state == 1) || (trigger.state == 3))
				return true;
		}
		
		return false;
	};
	
	var triggerState = function(config, trigger, args) {
		if((args.$activity) && (args.$activity.trigger) &&
			(args.$activity.trigger.wifi) && 
			(args.$activity.trigger.wifi.state))
		{
			var state = "unknown";
			var ssid = "none";
			
			state = args.$activity.trigger.wifi.state;
			
			if(args.$activity.trigger.wifi.ssid)
				ssid = args.$activity.trigger.wifi.ssid.toLowerCase();
			
			if((config.state != state) || (config.ssid != ssid))
				return true;
		}
		
		return false;
	};
	
// Asynchronous public functions
	
	that.initialize = function(config, triggers) {
		config.activity = null;
		config.state = "unknown";
		config.ssid = "unknown";
		
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
		config.state = "unknown";
		config.ssid = "unknown";
		
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
		config.state = "unknown";
		config.ssid = "unknown";
		
		var future = new Future();
		
		if((triggers.length == 0) || 
			(!args.$activity) || (!args.$activity.trigger) || 
			(args.$activity.trigger.returnValue == false))
		{
			future.result = { returnValue: true };
		}
		else {
			if(args.$activity.trigger.wifi) {
				if(args.$activity.trigger.wifi.state == "connected")
					config.state = "connected";
				else
					config.state = "disconnected";
				
				if(args.$activity.trigger.wifi.ssid)
					config.ssid = args.$activity.trigger.wifi.ssid.toLowerCase();
				else
					config.ssid = "none";
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
