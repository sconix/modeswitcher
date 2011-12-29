function SupportAssistant(customModes) {
	this.customModes = customModes;
}

//

SupportAssistant.prototype.setup = function() {
	if(this.customModes) {
		this.modelMenu = {
			visible: true,
			items: [
				{label: $L("Report Problem"), command: 'debug'},
				{label: $L("Changelog"), command: 'changelog'} ]
		};
	}
	else {
		this.modelMenu = {
			visible: true,
			items: [
				{label: $L("Changelog"), command: 'changelog'} ]
		};
	}	

	this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true},
		this.modelMenu);

	// SHOW HELP

	this.controller.get('appver').update(Mojo.Controller.appInfo.version);
	this.controller.get('appname').update(Mojo.Controller.appInfo.title);

	this.controller.listen(this.controller.get('WikiLink'), Mojo.Event.tap, 
		this.openUrl.bind(this, "wiki"));

	this.controller.listen(this.controller.get('IRCLink'), Mojo.Event.tap, 
		this.openUrl.bind(this, "irc"));

	this.controller.listen(this.controller.get('ForumLink'), Mojo.Event.tap, 
		this.openUrl.bind(this, "forum"));

	this.controller.listen(this.controller.get('EmailLink'), Mojo.Event.tap, 
		this.sendEmail.bind(this, "help"));
}

SupportAssistant.prototype.cleanup = function() {
}

//

SupportAssistant.prototype.activate = function() {
}

SupportAssistant.prototype.deactivate = function() {
}

//

SupportAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		if(event.command == "debug") {
			this.controller.serviceRequest("palm://org.webosinternals.lumberjack", {
				method: 'getMessages', parameters: {},
				onSuccess: function(response) {
					if(response.stage == "start") {
						this.messagesLog = "";
						this.messagesLogAll = "";
					}
					else if(response.stage == "middle") {
						if(response.contents) {
							this.messagesLogAll += response.contents;
							
							var position = this.messagesLogAll.lastIndexOf("\n");
				
							if (position) {
								this.parseMessages(this.messagesLogAll.substr(0, position));
								this.messagesLogAll = this.messagesLogAll.substr(position);
							}
						}
					}
					else if(response.stage == "end") {
						if(response.contents != '') {
							this.messagesLogAll += response.contents;
							this.parseMessages(this.messagesLogAll);
						}
					
						this.controller.serviceRequest("palm://com.palm.applicationManager", {
							method: 'open', parameters: {id: "com.palm.app.email", params: {
							summary: "Mode Switcher Problems",
							text: "Give a detailed description of your problem. Your messages log " +
								"and configuration is already included for debugging purposes." +
								"<br><br>Configuration:<br><br>" + Object.toJSON(this.customModes) +
								"<br><br>Messages Log:<br><br>" + this.messagesLog,
							recipients: [{
								type:"email",
								role:1,
								value:"janne.julkunen@e-lnx.org",
								contactDisplay:"Mode Switcher Author"
							}]}}}); 
					}
				}.bind(this),
				onFailure: function(response) {
					this.controller.showAlertDialog({
						title: $L("Lumberjack not installed!"),
						message: "<div align='justify'>" + 
						$L("You need to have lumberjack installed to send problem report. " + 
							"Without lumberjack the log can't be included and its impossible " +
							"to see what is wrong.") + "</div>",
						choices:[{label:$L("Ok"), value:"ok", type:'default'}],
						preventCancel: true,
						allowHTMLMessage: true})
				}.bind(this) });
		}
		else if(event.command == 'changelog')		
			this.controller.stageController.pushScene("startup");
	}
};

SupportAssistant.prototype.parseMessages = function(data) {
	if(data) {
		var array = data.split("\n");
		
		if(array.length > 0) {
			for (var i = 0; i < array.length; i++) {
				if(array[i].include("org.e.lnx.wee.modeswitcher"))
					this.messagesLog += array[i] + "<br>";
			}
		}
	}
};

//

SupportAssistant.prototype.openUrl = function(link) {
	if(link == "wiki")
		window.open('http://www.webos-internals.org/wiki/Application:ModeSwitcher');
	else if(link == "irc")
		window.open('http://webchat.freenode.net?channels=webos-internals');
	else if(link == "forum")
		window.open('http://forums.precentral.net/enlightened-linux-solutions/279166-app-mode-switcher-2-x.html');
}

SupportAssistant.prototype.sendEmail = function(link) {
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
	  method: 'open', parameters: {id: "com.palm.app.email", params: {
       summary: "Mode Switcher Question",
       text: "If you think that Mode Switcher is not working correctly then " +
       	"please use the 'Report Problem' action in the menu instead of sending " +
       	"this email. Also before contacting me you should have tried to find answer " +
       	"to your question from other resources such as the Wiki and Forum.",
       recipients: [{
           type:"email",
           role:1,
           value:"janne.julkunen@e-lnx.org",
           contactDisplay:"Mode Switcher Author"
       }]}}}); 
}

