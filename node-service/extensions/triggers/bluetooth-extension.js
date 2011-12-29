/*
	Bluetooth Configuration Object:
	
	state:					integer,
	device:					string,
	profile:					string
	
	Bluetooth Status Object:
	
	activity:				integer,
	connected:				[{
		device:					string,
		profile:					string 
	}],
*/

var bluetoothTriggers = (function() {
	var that = {};
	
	var Foundations = IMPORTS.foundations;
	
	var PalmCall = Foundations.Comms.PalmCall;
	
	var Future = Foundations.Control.Future;

//

	var waitTimeout = function(config) {
		var future = new Future();
		
		setTimeout(function(future) { future.result = true; }.bind(this, future), 3000);
		
		return future;
	};
	
//
	
	var initExtension = function(config) {
		var future = new Future();
		
		future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
			'id': "com.palm.app.bluetooth", 'service': "com.palm.btmonitor/monitor", 
			'method': "getradiostate", 'params': {}})); 
		
		future.then(this, function(future) {
			if(future.result.radio == "on") {
				future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.sys/", "systemCall", {
					'id': "com.palm.app.bluetooth", 'service': "com.palm.bluetooth/prof", 
					'method': "profgetstate", 'params': {'profile': "all"}})); 
				
				future.then(this, function(future) {
					var profiles = future.result.profiles;
					
					for(var i = 0; i < profiles.length; i++) {
						var devices = future.result[profiles[i]];
						
						for(var j = 0; j < devices.length; j++) {
							if((devices[j].name != undefined) && (devices[j].state == "connected")) {
								config.connected.push({'device': devices[j].name.toLowerCase(), 'profile': profiles[i]});
							}
						}
					}
					
					future.result = true;
				});
			}
			else
				future.result = true;
		});
		
		return future;
	};
	
	var addActivity = function(config) {
		var future = new Future();
		
		var newActivity = {
			"start" : true,
			"replace": true,
			"activity": {
				"name": "bluetoothTrigger",
				"description" : "Bluetooth Connections Notifier",
				"type": {"cancellable": true, "foreground": true, "persist": false},
				"trigger" : {
					"method" : "palm://com.palm.bluetooth/prof/subscribenotifications",
					"params" : {'subscribe': true}
				},
				"callback" : {
					"method" : "palm://org.e.lnx.wee.modeswitcher.srv/trigger",
					"params" : {"extension": "bluetooth"}
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
		for(var i = 0; i < config.connected.length; i++) {
			if((trigger.state == 0) && ((trigger.profile == "any") || 
				(trigger.profile == config.connected[i].profile)))
			{
				return true;
			}
			else if((trigger.state == 1) && ((trigger.profile != "any") && 
				(trigger.profile == config.connected[i].profile)))
			{
				return false;
			}
			else if((trigger.state == 2) && ((trigger.profile == "any") || 
				(trigger.profile == config.connected[i].profile)) && 
				(trigger.device.toLowerCase() == config.connected[i].device))
			{
				return true;
			}
			else if((trigger.state == 3) && ((trigger.profile != "any") && 
				(trigger.profile == config.connected[i].profile)) &&
				(trigger.device.toLowerCase() == config.connected[i].device))
			{
				return false;
			}
		}
		
		if((trigger.state == 0) || (trigger.state == 2))
			return false;
		
		return true;
	};
	
	var triggerState = function(config, trigger, args) {
		if((args.$activity) && (args.$activity.trigger) && 
			(args.$activity.trigger.notification != undefined))
		{
			if((args.$activity.trigger.notification == "notifnconnected") || 
				(args.$activity.trigger.notification == "notifndisconnected") || 
				(args.$activity.trigger.notification == "notifndisconnecting"))
			{
				return true;
			}
		}
		
/*
			var device = "unknown";
			var profile = "any";
			
			if(args.$activity.trigger.name)
				device = args.$activity.trigger.name.toLowerCase();
			
			if(args.$activity.trigger.profile)
				profile = args.$activity.trigger.profile;
			
			var index = -1;
			
			for(var i = 0; i < config.connected.length; i++) {
				if((config.connected[i].device == device) &&
					(config.connected[i].profile == profile))
				{
					index = i;
					break;
				}
			}
			
			if(((index == -1) && (args.$activity.trigger.notification == "notifnconnected")) || 
				((index != -1) && ((args.$activity.trigger.notification == "notifndisconnected") || 
				(args.$activity.trigger.notification == "notifndisconnecting"))))
			{
				if((trigger.state == 0) && ((trigger.profile == "any") || 
					(trigger.profile == profile)))
				{
					return true;
				}
				else if((trigger.state == 1) && ((trigger.profile == "any") || 
					(trigger.profile == profile)))
				{
					return true;
				}				
				else if((trigger.state == 2) && ((trigger.profile == "any") || 
					(trigger.profile == profile)) && (trigger.device.toLowerCase() == device))
				{
					return true;
				}
				else if((trigger.state == 3) && (((trigger.profile == "any") || 
					(trigger.profile == profile)) && (trigger.device.toLowerCase() == device)))
				{
					return true;
				}
			}
		} */
		
		return false;
	};
	
// Asynchronous public functions
	
	that.initialize = function(config, triggers) {
		config.activity = null;
		config.connected = [];
		
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
		config.connected = [];
		
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
		
		var future = new Future();
		
		if((triggers.length == 0) || 
			(!args.$activity) || (!args.$activity.trigger) || 
			(args.$activity.trigger.returnValue == false))
		{
			future.result = { returnValue: true };
		}
		else {
			if((args.$activity.trigger.notification == "notifnconnected") || 
				(args.$activity.trigger.notification == "notifndisconnecting") ||
				(args.$activity.trigger.notification == "notifndisconnected"))
			{
				future.nest(waitTimeout());
				
				future.then(this, function(future) { 
					config.connected = [];					
					
					future.nest(addActivity(config));
					
					future.then(this, function(future) {
						future.nest(initExtension(config));
					});
					
					future.then(this, function(future) {
						future.result = { returnValue: true };
					});
				});
			}
			else {
				future.nest(addActivity(config));
				
				future.then(this, function(future) {
					future.result = { returnValue: true };
				});
			}
/*
			var device = "unknown";
			var profile = "any";
			
			if(args.$activity.trigger.name != undefined)
				device = args.$activity.trigger.name.toLowerCase();
			
			if(args.$activity.trigger.profile != undefined)
				profile = args.$activity.trigger.profile;
			
			if(args.$activity.trigger.notification == "notifnconnected") {
				var index = -1;
				
				for(var i = 0; i < config.connected.length; i++) {
					if((config.connected[i].device == device) &&
						(config.connected[i].profile == profile))
					{
						index = i;
						break;
					}
				}
				
				if(index == -1)
					config.connected.push({'device': device, 'profile': profile});
			}
			else if((args.$activity.trigger.notification == "notifndisconnected") || 
				(args.$activity.trigger.notification == "notifndisconnecting"))
			{
				for(var i = 0; i < config.connected.length; i++) {
					if((config.connected[i].device == device) &&
						(config.connected[i].profile == profile))
					{
						config.connected.splice(i--, 1);
						break;
					}
				}
			}
			
			future.nest(addActivity(config));
			
			future.then(this, function(future) {
				future.result = { returnValue: true };
			}); */
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
