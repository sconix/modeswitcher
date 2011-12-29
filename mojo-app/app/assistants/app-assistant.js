/*
 *    AppAssistant - App Assistant for Mode Launcher
 */

function AppAssistant(appController) {
	/* This is the creator function for your app assistant object (the first created scene). */
}

//

AppAssistant.prototype.setup = function() {
	/* This function is for setup tasks that have to happen when the scene is first created. */
}

AppAssistant.prototype.cleanup = function() {
	/* This function should do any cleanup needed before the execution is interrupted. */
}

//

AppAssistant.prototype.handleLaunch = function(params) {
	this.isNewOrFirstStart = this.checkVersion();
	
	if((params) && (params.action == "notify")) {
		// TODO: add support for sound alert! (params.alert)

		var appController = Mojo.Controller.getAppController();

		if(params.event == "error")
			appController.showBanner($L("Error: Mode change was aborted"), {action: 'none'});
		else if(params.event == "unknown")	
			appController.showBanner($L("Unknown mode name") + ": " + params.name, {action: 'none'});	
		else if((params.notify == 2) || (params.notify == 5) || (params.notify == 6)) {
			if(params.event == "start")
				appController.showBanner($L("Starting mode") + ": " + params.name, {action: 'none'});
			else if(params.event == "close")
				appController.showBanner($L("Closing mode") + ": " + params.name, {action: 'none'});
			else if(params.event == "switch")
				appController.showBanner($L("Switching mode to") + ": " + params.name, {action: 'none'});
			else if(params.event == "reload")	
				appController.showBanner($L("Reloading current system settings"), {action: 'none'});
			else if(params.event == "update")	
				appController.showBanner($L("Updating current system settings"), {action: 'none'});
		}
		
		if((params.notify == 3) || (params.notify == 5)) {
			appController.playSoundNotification("notifications");
		}
		else if((params.notify == 4) || (params.notify == 6)) {
			appController.playSoundNotification("vibrate");			
		}
	}
	else	
		this.executeLaunch(params);
}

AppAssistant.prototype.executeLaunch = function(params) {
	if((!params) || (params.action == "edit")) {
		var stageController = this.controller.getStageController("main");

		if(stageController) {
			Mojo.Log.info("Main stage card already exists");
			
			stageController.activate();
		}
		else {
			Mojo.Log.info("Creating new main stage card");

			var mainScene = function(stageController) {
				if(this.isNewOrFirstStart)
					stageController.pushScene("startup");
				else
					stageController.pushScene("main", params);
			};
				
			var stageArgs = {name: "main", lightweight: true};
			
			this.controller.createStageWithCallback(stageArgs, 
				mainScene.bind(this), "card");
		}
	}
	else if((params) && (params.action == "popup")) {
		var stageController = this.controller.getStageController("popup");

		if(stageController) {
			Mojo.Log.info("Popup stage card already exists");
			
			stageController.activate();
		}
		else {
			Mojo.Log.info("Creating new popup stage card");

			var mainScene = function(stageController) {
				stageController.pushScene("popup", "popup", params);
			};
				
			var stageArgs = {name: "popup", lightweight: true, height: 177};

			if((params.notify == 1) || (params.notify == 2))
				stageArgs.soundclass = "none"
			else if((params.notify == 3) || (params.notify == 5))
				stageArgs.soundclass = "notifications";
			else if((params.notify == 4) || (params.notify == 6))
				stageArgs.soundclass = "vibrate";
			
			this.controller.createStageWithCallback(stageArgs, 
				mainScene.bind(this), "popupalert");
		}
	}
	else if((params) && (params.action == "toggle")) {
		var stageController = this.controller.getStageController("toggle");

		if(stageController) {
			Mojo.Log.info("Toggle stage card already exists");
			
			stageController.activate();
		}
		else {
			Mojo.Log.info("Creating new toggle stage card");

			var mainScene = function(stageController) {
				stageController.pushScene("popup", "toggle", params);
			};
				
			var stageArgs = {name: "toggle", lightweight: true};
			
			this.controller.createStageWithCallback(stageArgs, 
				mainScene.bind(this), "card");
		}
	}
	else if((params) && (params.type == "govnah-profiles")) {
		var stageController = this.controller.getStageController("main");

		if(stageController)
			stageController.delegateToSceneAssistant("govnahProfiles", params.profiles);
	}
}

//

AppAssistant.prototype.checkVersion = function() {
	var isNewOrFirstStart = false;

	var cookie = new Mojo.Model.Cookie('version');

//	cookie.remove();

	var data = cookie.get();
	
	if(!data)
		isNewOrFirstStart = 1;	
	else if(data.version !=  Mojo.appInfo.version)
		isNewOrFirstStart = 2;
		
	cookie.put({'version': Mojo.appInfo.version});

	return isNewOrFirstStart;
}

