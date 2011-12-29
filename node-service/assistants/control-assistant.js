var ControlCommandAssistant = function() {
}

//

ControlCommandAssistant.prototype.setup = function() {
}

ControlCommandAssistant.prototype.run = function(future) {
	console.error("MS - Control - Run - " + JSON.stringify(this.controller.args));
	
	this.controller.service.assistant.appendCommand(future, 
		this.controller.args, this.command.bind(this));
}

ControlCommandAssistant.prototype.cleanup = function() {
}

//

ControlCommandAssistant.prototype.command = function(future, args) {
	console.error("MS - Control - Command - " + JSON.stringify(args));
	
	future.nest(prefs.load());
	
	future.then(this, function(future) {
		var config = future.result;
	
		if(config.activated == true) {
			if(args.action == "startup")
				this.startupModeSwitcher(future, config);
			else if(args.action == "enable")
				future.result = { returnValue: true };
			else if(args.action == "disable")
				this.disableModeSwitcher(future, config);
			else if(args.action == "reload")
				this.reloadModeSwitcher(future, config);
			else if(args.action == "lock")
				this.lockModeSwitcher(future, config);
			else if(args.action == "unlock")
				this.unlockModeSwitcher(future, config);
			else 
				future.result = { returnValue: false, errorText: "Unknown Command" };
		}
		else {
			if(args.action == "enable")
				this.enableModeSwitcher(future, config);
			else if(args.action == "disable")
				future.result = { returnValue: false, errorText: "Not activated" };
			else if(args.action == "reload")
				future.result = { returnValue: false, errorText: "Not activated" };
			else if(args.action == "lock")
				future.result = { returnValue: false, errorText: "Not activated" };
			else if(args.action == "unlock")
				future.result = { returnValue: false, errorText: "Not activated" };
			else if(args.action == "startup")
				future.result = { returnValue: false, errorText: "Not activated" };
			else 
				future.result = { returnValue: false, errorText: "Unknown Command"  };
		}
	});
}

//

ControlCommandAssistant.prototype.startupModeSwitcher = function(future, config) {
	console.error("MS - Control - Startup - " + config.customModes[0].startup);
	
	future.nest(utils.futureLoop(config.extensions.triggers, 
		function(item) {
			var future = new Future();
		
			if(!config.statusData.triggers[item])	
				config.statusData.triggers[item] = {};
			
			var configData = config.statusData.triggers[item];
			
			var triggersData = [];
			
			for(var i = 0; i < config.customModes.length; i++) {
				for(var j = 0; j < config.customModes[i].triggers.length; j++) {
					for(var k = 0; k < config.customModes[i].triggers[j].list.length; k++) {
						if(config.customModes[i].triggers[j].list[k].extension == item)
							triggersData.push(config.customModes[i].triggers[j].list[k]);
					}
				}
			}
			
			// Do shutdown for luna restarts (would otherwise not be needed)
			
			console.error("Re-initializing trigger extension: " + item);
			
			eval("future.nest(" + item + "Triggers.shutdown(configData));");
			
			future.then(this, function(future) {
				eval("future.nest(" + item + "Triggers.initialize(configData, triggersData));");
				
				future.then(this, function(future) { future.result = { returnValue: true }; });
			});
			
			return future;
		}.bind(this)));
	
	future.then(this, function(future) {
		var newConfig = { modeLocked: false, historyList: [], statusData: config.statusData };
		
		future.nest(prefs.save(newConfig));
		
		future.then(this, function(future) {
			var mode = "Current Mode";
		
			if(config.customModes[0].startup == 1)
				mode = "Default Mode";
			
			future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.srv", "execute", {
				'action': "reload", 'name': mode, 'startup': true}));
			
			future.result = { returnValue: true };
		});
	});
}

ControlCommandAssistant.prototype.enableModeSwitcher = function(future, config) {  
	console.error("MS - Control - Enable");
	
	future.nest(utils.futureLoop(config.extensions.triggers, 
		function(item) {
			var future = new Future();

			if(!config.statusData.triggers[item])	
				config.statusData.triggers[item] = {};
			
			var configData = config.statusData.triggers[item];
			
			var triggersData = [];
			
			for(var i = 0; i < config.customModes.length; i++) {
				for(var j = 0; j < config.customModes[i].triggers.length; j++) {
					for(var k = 0; k < config.customModes[i].triggers[j].list.length; k++) {
						if(config.customModes[i].triggers[j].list[k].extension == item)
							triggersData.push(config.customModes[i].triggers[j].list[k]);
					}
				}
			}
			
			console.error("Initializing trigger extension: " + item);
			
			eval("future.nest(" + item + "Triggers.initialize(configData, triggersData));");
			
			future.then(this, function(future) { future.result = { returnValue: true }; });

			return future;
		}.bind(this)));
	
	future.then(this, function(future) {
		var newConfig = { activated: true, modeLocked: false, activeModes: [], historyList: [], 
			statusData: config.statusData };
		
		future.nest(prefs.save(newConfig));
		
		future.then(this, function(future) { future.result = { returnValue: true }; });
	});
}

ControlCommandAssistant.prototype.disableModeSwitcher = function(future, config) {
	console.error("MS - Control - Disable");
	
	future.nest(utils.futureLoop(config.extensions.triggers, 
		function(item) {
			var future = new Future();
			
			if(!config.statusData.triggers[item])	
				config.statusData.triggers[item] = {};
			
			var configData = config.statusData.triggers[item];
			
			console.error("Uninitializing trigger extension: " + item);
			
			eval("future.nest(" + item + "Triggers.shutdown(configData));");
			
			future.then(this, function(future) { future.result = { returnValue: true }; });

			return future;
		}.bind(this)));
	
	future.then(this, function(future) {
		var newConfig = { activated: false, modeLocked: false, activeModes: [], historyList: [],
			statusData: config.statusData };
		
		future.nest(prefs.save(newConfig));
		
		future.then(this, function(future) { future.result = { returnValue: true }; });
	});
}

ControlCommandAssistant.prototype.reloadModeSwitcher = function(future, config) {
	console.error("MS - Control - Reload");
	
	future.nest(utils.futureLoop(config.extensions.triggers, 
		function(item) {
			var future = new Future();
			
			if(!config.statusData.triggers[item])	
				config.statusData.triggers[item] = {};
			
			var configData = config.statusData.triggers[item];
			
			var triggersData = [];
			
			for(var i = 0; i < config.customModes.length; i++) {
				for(var j = 0; j < config.customModes[i].triggers.length; j++) {
					for(var k = 0; k < config.customModes[i].triggers[j].list.length; k++) {
						if(config.customModes[i].triggers[j].list[k].extension == item)
							triggersData.push(config.customModes[i].triggers[j].list[k]);
					}
				}
			}
			
			console.error("Re-initializing trigger extension: " + item);
			
			eval("future.nest(" + item + "Triggers.shutdown(configData));");
			
			future.then(this, function(future) {
				eval("future.nest(" + item + "Triggers.initialize(configData, triggersData));");
				
				future.then(this, function(future) { future.result = { returnValue: true }; });
			});
	
			return future;
		}.bind(this)));
	
	future.then(this, function(future) {
		var newConfig = { statusData: config.statusData }
		
		future.nest(prefs.save(newConfig));
		
		future.then(this, function(future) {
			future.nest(PalmCall.call("palm://org.e.lnx.wee.modeswitcher.srv", "execute", {
				'action': "reload", 'name': "Current Mode"}));
			
			future.result = { returnValue: true };
		});
	});
}

ControlCommandAssistant.prototype.lockModeSwitcher = function(future, config) {
	console.error("MS - Control - Lock");
	
	future.nest(prefs.save({ modeLocked: true }));
	
	future.then(this, function(future) { future.result = { returnValue: true }; });
}

ControlCommandAssistant.prototype.unlockModeSwitcher = function(future, config) {
	console.error("MS - Control - Unlock");
	
	future.nest(prefs.save({ modeLocked: false }));
	
	future.then(this, function(future) { future.result = { returnValue: true }; });
}
