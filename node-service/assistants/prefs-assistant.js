var PrefsCommandAssistant = function() {
}

//

PrefsCommandAssistant.prototype.setup = function() {
}

PrefsCommandAssistant.prototype.run = function(future) {
	if(this.controller.args.keys) {
		future.nest(prefs.load());
		
		future.then(this, function(future) {
			var config = {};
			
			var curConfig = future.result;
			
			if(this.controller.args.keys.indexOf("activated") != -1)
				config.activated = curConfig.activated;
			
			if(this.controller.args.keys.indexOf("modeLocked") != -1)
				config.modeLocked = curConfig.modeLocked;
			
			if(this.controller.args.keys.indexOf("apiVersion") != -1)
				config.apiVersion = curConfig.apiVersion;
			
			if(this.controller.args.keys.indexOf("cfgVersion") != -1)
				config.cfgVersion = curConfig.cfgVersion;
			
			if(this.controller.args.keys.indexOf("startTimer") != -1)
				config.startTimer = curConfig.startTimer;
			
			if(this.controller.args.keys.indexOf("closeTimer") != -1)
				config.closeTimer = curConfig.closeTimer;
			
			if(this.controller.args.keys.indexOf("activeModes") != -1)
				config.activeModes = curConfig.activeModes;
			
			if(this.controller.args.keys.indexOf("customModes") != -1)
				config.customModes = curConfig.customModes;
			
			if(this.controller.args.keys.indexOf("extensions") != -1)
				config.extensions = curConfig.extensions;
			
			if(this.controller.args.keys.indexOf("preferences") != -1)
				config.preferences = curConfig.preferences;
			
			future.result = config;
		});
	}
	else {
		var newConfig = {};
		
		if(this.controller.args.startTimer != undefined)
			newConfig.startTimer = this.controller.args.startTimer;
		
		if(this.controller.args.closeTimer != undefined)
			newConfig.closeTimer = this.controller.args.closeTimer;
		
		if(this.controller.args.modeLocked != undefined)
			newConfig.modeLocked = this.controller.args.modeLocked;
		
		if(this.controller.args.activeModes != undefined)
			newConfig.activeModes = this.controller.args.activeModes;
		
		if(this.controller.args.customModes != undefined)
			newConfig.customModes = this.controller.args.customModes;
		
		if(this.controller.args.extensions != undefined)
			newConfig.extensions = this.controller.args.extensions;
		
		if(this.controller.args.preferences != undefined)
			newConfig.preferences = this.controller.args.preferences;
		
		future.nest(prefs.save(newConfig));
		
		future.then(this, function(future) {
			future.result = { returnValue: true };
		});
	}
}

PrefsCommandAssistant.prototype.cleanup = function() {
}
