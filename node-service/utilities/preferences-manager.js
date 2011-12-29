var prefs = (function() {
	var that = {};
	
	var Foundations = IMPORTS.foundations;
	
	var DB = Foundations.Data.DB;
	
	var DB_KIND = "org.e.lnx.wee.modeswitcher:1";
	
	var subscriptions = {};
	
	var defaultPrefs = function() {
		return {
			_kind: DB_KIND,
			activated: false,
			modeLocked: false,
			apiVersion: "2.5",
			cfgVersion: "2.5",
			startTimer: 10000,
			closeTimer: 10000,
			historyList: [],
			activeModes: [],
			customModes: [],
			extensions: {
				actions: [], 
				settings: [], 
				triggers: []},
			statusData: {
				actions: {}, // Not used currently
				settings: {}, // Not used currently
				triggers: {}},
			preferences: {
				actions: {}, // Not used currently
				settings: {}, 
				triggers: {}} // Not used currently
		};
	};

//

	var initPrefs = function() {
		var future = DB.putKind(DB_KIND, "org.e.lnx.wee.modeswitcher", []);
		
		future.then(this, function(future) {
			future.result = { returnValue: true };
		});
		
		return future;
	};
	
	var loadPrefs = function() {
		var future = DB.find({ from: DB_KIND, limit: 2 });
		
		future.then(this, function(future) {
			var result = future.result;
			
			var len = result.results ? result.results.length : 0;
			
			if (len === 0)
				future.result = defaultPrefs();
			else if (len > 1)
				throw new Error("More than 1 preferences object found");
			else
				future.result = result.results[0];
		});
		
		return future;
	};
	
	var savePrefs = function(prefs) {
		var future = DB.put([prefs]);
		
		future.then(this, function(future) {
			var result = future.result;
			
//			if(result.returnValue === true)
				future.result = { returnValue: true };
		/*	else {
				future.nest(loadPrefs());
				
				future.then(this, function(future) {
					var result = future.result;
					
					//if(result._rev != newPrefs._rev) {
						updatePrefs(result, prefs);
						
						future.nest(savePrefs(result));
						
						future.then(this, function(future) {
							future.result = { returnValue: true };
						});
					//}
					//else
						//future.result = { returnValue: false };
				});
			}*/
		});
		
		return future;
	};

//

	var checkPrefs = function(curPrefs) {
		var currentVersion = defaultPrefs().cfgVersion;
		
		if(curPrefs.cfgVersion != currentVersion) {
			console.error("Mode Switcher updating preferences");
			
			curPrefs.apiVersion = currentVersion;
			curPrefs.cfgVersion = currentVersion;
			
			for(var i = 0; i < curPrefs.customModes.length; i++) {
				curPrefs.customModes[i].actions = curPrefs.customModes[i].appssrvs;
				delete curPrefs.customModes[i].appssrvs;
				
				curPrefs.customModes[i].notify = curPrefs.customModes[i].settings.notify;
				curPrefs.customModes[i].settings = curPrefs.customModes[i].settings.list;
				
				for(var j = 0; j < curPrefs.customModes[i].settings.length; j++) {
					if(curPrefs.customModes[i].settings[j].extension == "email") {
						if(curPrefs.customModes[i].settings[j].accounts) {
							var accounts = {};
							
							for(var k = 0; k < curPrefs.customModes[i].settings[j].accounts.length; k++) {
								var accId = curPrefs.customModes[i].settings[j].accounts[k].accountId;
								
								accounts[accId] = {
									databaseId: curPrefs.customModes[i].settings[j].accounts[k].id,
									identifier: curPrefs.customModes[i].settings[j].accounts[k].identifier };
							}
							
							curPrefs.customModes[i].settings[j].accounts = accounts;
						}
					}
					else if(curPrefs.customModes[i].settings[j].extension == "messaging") {
						if(curPrefs.customModes[i].settings[j].accounts) {
							var accounts = {};
							
							for(var k = 0; k < curPrefs.customModes[i].settings[j].accounts.length; k++) {
								var accId = curPrefs.customModes[i].settings[j].accounts[k].accountId;
								
								accounts[accId] = {
									databaseId: curPrefs.customModes[i].settings[j].accounts[k].id,
									serviceName: curPrefs.customModes[i].settings[j].accounts[k].serviceName,
									identifier: curPrefs.customModes[i].settings[j].accounts[k].identifier };
							}
							
							curPrefs.customModes[i].settings[j].accounts = accounts;
						}
					}
				}
				
				for(var j = 0; j < curPrefs.customModes[i].triggers.list.length; j++) {
					if(curPrefs.customModes[i].triggers.list[j].group == undefined)
						curPrefs.customModes[i].triggers.list[j].group = 0;
				}
					
				if(curPrefs.customModes[i].triggers.require == 0) {
					if(curPrefs.customModes[i].triggers.list.length == 0)
						curPrefs.customModes[i].triggers = [];
					else
						curPrefs.customModes[i].triggers = [{require: 0, list: curPrefs.customModes[i].triggers.list}];
				}
				else if(curPrefs.customModes[i].triggers.require == 1) {
					if(curPrefs.customModes[i].triggers.list.length == 0)
						curPrefs.customModes[i].triggers = [];
					else
						curPrefs.customModes[i].triggers = [{require: 1, list: curPrefs.customModes[i].triggers.list}];
				}
				else if(curPrefs.customModes[i].triggers.require == 2) {
					var triggers = [];
					
					for(var group = 0; group < 10; group++) {
						var tlist = [];
						
						for(var j = 0; j < curPrefs.customModes[i].triggers.list.length; j++) {
							if(curPrefs.customModes[i].triggers.list[j].group == group)
								tlist.push(curPrefs.customModes[i].triggers.list[j]);
						}
						
						if(tlist.length > 0)
							triggers.push({require: 2, list: tlist});
					}
					
					curPrefs.customModes[i].triggers = triggers;
				}
			}
			
			curPrefs.extensions.actions = ["browser", "default", "govnah", "modesw", "phoneapp", "systools"];
			delete curPrefs.extensions.appssrvs;
			
			curPrefs.extensions.settings = ["airplane", "calendar", "connection", "contacts", "email", 
				"messaging", "network", "phone", "ringer", "screen", "security", "sound"];
			
			curPrefs.extensions.triggers = ["application", "battery", "bluetooth", "calevent", "charger", 
					"display", "headset", "interval", "location", "modechange", "silentsw", "timeofday", "wireless"];
			
			curPrefs.statusData.actions = {};
			delete curPrefs.statusData.appssrvs;
			
			if(curPrefs.preferences == undefined)
				curPrefs.preferences = {actions: {}, settings: {}, triggers: {}};
			else {
				curPrefs.preferences.actions = curPrefs.preferences.appssrvs;
				
				delete curPrefs.preferences.appssrvs;
			}
			
			return true;
		}
		
		return false
	};
	
	var updatePrefs = function(oldPrefs, newPrefs) {
		if(newPrefs.activated != undefined)
			oldPrefs.activated = newPrefs.activated;
		
		if(newPrefs.modeLocked != undefined)
			oldPrefs.modeLocked = newPrefs.modeLocked;
		
		if(newPrefs.apiVersion != undefined)
			oldPrefs.apiVersion = newPrefs.apiVersion;
		
		if(newPrefs.cfgVersion != undefined)
			oldPrefs.cfgVersion = newPrefs.cfgVersion;
		
		if(newPrefs.startTimer != undefined)
			oldPrefs.startTimer = newPrefs.startTimer;
		
		if(newPrefs.closeTimer != undefined)
			oldPrefs.closeTimer = newPrefs.closeTimer;
		
		if(newPrefs.historyList != undefined)
			oldPrefs.historyList = newPrefs.historyList;
		
		if(newPrefs.activeModes != undefined)
			oldPrefs.activeModes = newPrefs.activeModes;
		
		if(newPrefs.customModes != undefined)
			oldPrefs.customModes = newPrefs.customModes;
		
		if(newPrefs.extensions != undefined) {
			if(newPrefs.extensions.actions != undefined)
				oldPrefs.extensions.actions = newPrefs.extensions.actions;
			
			if(newPrefs.extensions.settings != undefined)
				oldPrefs.extensions.settings = newPrefs.extensions.settings;
			
			if(newPrefs.extensions.triggers != undefined)
				oldPrefs.extensions.triggers = newPrefs.extensions.triggers;
		}
		
		if(newPrefs.statusData != undefined) {
			if(newPrefs.statusData.actions != undefined) {
				for(var ext in newPrefs.statusData.actions) {
					oldPrefs.statusData.actions[ext] = newPrefs.statusData.actions[ext];
				}
			}
			
			if(newPrefs.statusData.settings != undefined) {
				for(var ext in newPrefs.statusData.settings) {
					oldPrefs.statusData.settings[ext] = newPrefs.statusData.settings[ext];
				}
			}
			
			if(newPrefs.statusData.triggers != undefined) {
				for(var ext in newPrefs.statusData.triggers) {
					oldPrefs.statusData.triggers[ext] = newPrefs.statusData.triggers[ext];
				}
			}
		}
		
		if(newPrefs.preferences != undefined) {
			if(newPrefs.preferences.actions != undefined) {
				for(var ext in newPrefs.preferences.actions) {
					oldPrefs.preferences.actions[ext] = newPrefs.preferences.actions[ext];
				}
			}
			
			if(newPrefs.preferences.settings != undefined) {
				for(var ext in newPrefs.preferences.settings) {
					oldPrefs.preferences.settings[ext] = newPrefs.preferences.settings[ext];
				}
			}
			
			if(newPrefs.preferences.triggers != undefined) {
				for(var ext in newPrefs.preferences.triggers) {
					oldPrefs.preferences.triggers[ext] = newPrefs.preferences.triggers[ext];
				}
			}
		}
	};
	
//
	
	var notifySubscribers = function(prefs) {
		for(var id in subscriptions) {
			var notifyKeys = null;
			
			for(var key in prefs) {
				if(subscriptions[id].keys.indexOf(key) != -1) {
					if(!notifyKeys)
						notifyKeys = {};
					
					notifyKeys[key] = prefs[key];
				}
			}
			
			if(notifyKeys) {
				var future = subscriptions[id].factory.get();
				
				future.result = notifyKeys;
			}
		}
	};
	
// Public functions...
	
	that.init = function() {
		return initPrefs();
	};
	
	that.load = function() {
		var future = loadPrefs();
		
		future.then(this, function(future) {
			console.error("Mode Switcher preferences loaded");
			
			var result = future.result;
			
			if(checkPrefs(result)) {
				future.nest(savePrefs(result));
				
				future.then(this, function(future) {
					future.result = result;
				});
			}
			else
				future.result = result;
		});
		
		return future;
	};
	
	that.save = function(prefs) {
		var future = loadPrefs(future);
		
		future.then(this, function(future) {
			var result = future.result;
			
			updatePrefs(result, prefs);
			
			future.nest(savePrefs(result));
			
			future.then(this, function(future) {
				console.error("Mode Switcher preferences saved");
				
				notifySubscribers(prefs);
				
				future.result = { returnValue: true };
			});
		});
		
		return future;
	};
	
//
	
	that.addSubscription = function(id, keys, factory) {
		subscriptions[id] = {'keys': keys, 'factory': factory};
	};
	
	that.delSubscription = function(id) {
		if(subscriptions[id])
			delete subscriptions[id];
	};
	
	return that;
}());
