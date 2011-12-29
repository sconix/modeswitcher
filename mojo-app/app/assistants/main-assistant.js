/*
 *    MainAssistant - Mode Launcher's Default Configuration Scene
 */

function MainAssistant(params) {
	/* This is the creator function for your scene assistant object. It will be passed all the 
	 * additional parameters (after the scene name) that were passed to pushScene. The reference
	 * to the scene controller (this.controller) has not be established yet, so any initialization
	 * that needs the scene controller should be done in the setup function below. 
	 */

	this.appControl = Mojo.Controller.getAppController();
	this.appAssistant = this.appControl.assistant;

	this.params = params;

	this.loading = true;

	this.modeLocked = false;

	this.apiVersion = "";
	this.cfgVersion = "";

	this.activeModes = [];
	this.customModes = [];

	this.extensions = {actions: [], settings: [], triggers: []};
	this.preferences = {actions: [], settings: [], triggers: []};	

	this.extensionModules = {actions: {}, settings: [], triggers: {}};
}    

MainAssistant.prototype.setup = function() {
	/* This function is for setup tasks that have to happen when the scene is first created
	 * Use Mojo.View.render to render view templates and add them to the scene, if needed.
    * Setup widgets and add event handlers to listen to events from widgets here. 
    */

	if(this.appAssistant.isNewOrFirstStart)
		this.controller.get("subTitle").innerHTML = "Have you already <a href=\"https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=7A4RPR9ZX3TYS&lc=FI&item_name=Mode%20Switcher%20Application&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted\">donated</a>?";

	this.controller.get("version").innerHTML = "v" + Mojo.Controller.appInfo.version;

	// Application menu
	
	this.modelAppMenu = {visible: true, items: [ 
		{label: $L("Export Modes"), command: 'export'},
		{label: $L("Import Modes"), command: 'import'},
		{label: $L("Extensions"), command: 'prefs'},
		{label: $L("Status"), command: 'status'},
		{label: $L("Help"), command: 'help'}]}
	
	this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true},
		this.modelAppMenu);
	
	// Activated toggle button

	this.modelActivatedButton = { value: false, disabled: false };

	this.controller.setupWidget('ActivatedButton', 
		{falseValue: false, falseLabel: $L("Off"), trueValue: true, trueLabel: $L("On")},
      this.modelActivatedButton);

	Mojo.Event.listen(this.controller.get('ActivatedButton'), 
		Mojo.Event.propertyChange, this.toggleModeSwitcher.bind(this));

	Mojo.Event.listen(this.controller.get('StatusText'), 
		Mojo.Event.tap, this.toggleModeSwitcher.bind(this));

	// Auto start & close timer selectors
	
	this.choicesStartSelector = [
		{label: "5 " + $L("Seconds"), value: 5},
		{label: "10 " + $L("Seconds"), value: 10},
		{label: "15 " + $L("Seconds"), value: 15},
		{label: "20 " + $L("Seconds"), value: 20},
		{label: "25 " + $L("Seconds"), value: 25},
		{label: "30 " + $L("Seconds"), value: 30}];

	this.modelStartSelector = {value: 10, disabled: false};
	   
	this.controller.setupWidget("StartSelector", {
		label: $L("Start Timer"),
		labelPlacement: "left", 							
		choices: this.choicesStartSelector},
		this.modelStartSelector);

	this.choicesCloseSelector = [
		{label: "5 " + $L("Seconds"), value: 5},
		{label: "10 " + $L("Seconds"), value: 10},
		{label: "15 " + $L("Seconds"), value: 15},
		{label: "20 " + $L("Seconds"), value: 20},
		{label: "25 " + $L("Seconds"), value: 25},
		{label: "30 " + $L("Seconds"), value: 30}];
		
	this.modelCloseSelector = {value: 10, disabled: false};
	   
	this.controller.setupWidget("CloseSelector", {
		label: $L("Close Timer"),
		labelPlacement: "left", 							
		choices: this.choicesCloseSelector},
		this.modelCloseSelector);
		
	Mojo.Event.listen(this.controller.get('StartSelector'), 
		Mojo.Event.propertyChange, this.setTimerPreferences.bind(this));

	Mojo.Event.listen(this.controller.get('CloseSelector'), 
		Mojo.Event.propertyChange, this.setTimerPreferences.bind(this));

	// Modes List
	
	this.modelModesList = {items: [], disabled: false};
	
	this.controller.setupWidget("ModesList", {
		itemTemplate: 'templates/modes-item',
		swipeToDelete: true,
		autoconfirmDelete: false,
		reorderable: true},
		this.modelModesList);
	
	this.handleModesListTap = this.handleModesListTap.bindAsEventListener(this);

	Mojo.Event.listen(this.controller.get('ModesList'), Mojo.Event.listTap, 
		this.handleModesListTap);
					
	Mojo.Event.listen(this.controller.get('ModesList'), Mojo.Event.listReorder, 
		this.handleModesListReorder.bind(this));

	Mojo.Event.listen(this.controller.get('ModesList'), Mojo.Event.listDelete, 
		this.handleRemoveModeFromList.bind(this));

	// Add custom mode button

	this.modelAddModeButton = {buttonClass: '', disabled: false};

	this.controller.setupWidget('AddModeButton', 
		{label: $L("Add Custom Mode")}, this.modelAddModeButton);
	
	Mojo.Event.listen(this.controller.get('AddModeButton'), Mojo.Event.tap, 
		this.handleAddModeButtonPress.bind(this));

	// Edit default mode button

	this.modelDefModeButton = {buttonClass: '', disabled: false};

	this.controller.setupWidget('DefModeButton', 
		{label: $L("Edit Default Mode")}, this.modelDefModeButton);
	
	Mojo.Event.listen(this.controller.get('DefModeButton'), Mojo.Event.tap, 
		this.handleDefModeButtonPress.bind(this));

	this.modelWaitSpinner = { spinning: false };

	this.controller.setupWidget('waitSpinner', {spinnerSize: Mojo.Widget.spinnerLarge}, this.modelWaitSpinner);
}

//

MainAssistant.prototype.updatePreferences = function(response) {
	this.modelActivatedButton.value = response.activated;

	this.controller.modelChanged(this.modelActivatedButton, this);

	this.modeLocked = response.modeLocked;

	if(this.modeLocked)
		this.controller.get("StatusText").innerHTML = "Activated & Locked";

	this.apiVersion = response.apiVersion;
	this.cfgVersion = response.cfgVersion;
	
	this.activeModes = response.activeModes;
	this.customModes = response.customModes;
	
	this.modelModesList.items.clear();

	for(var i = 1; i < this.customModes.length; i++)
		this.modelModesList.items.push(this.customModes[i]);

	this.controller.modelChanged(this.modelModesList, this);	
		
	this.modelStartSelector.value = response.startTimer / 1000;
	this.modelCloseSelector.value = response.closeTimer / 1000;

	this.controller.modelChanged(this.modelStartSelector, this);
	this.controller.modelChanged(this.modelCloseSelector, this);

	this.extensions = response.extensions;
	this.preferences = response.preferences;

	if(this.extensions.actions.length == 0) {
		this.extensions.actions = ["browser", "default", "govnah", "modesw", "phoneapp", "systools"];
	}

	if(this.extensions.settings.length == 0) {
		this.extensions.settings = ["airplane", "calendar", "connection", "contacts", "email", "messaging", 
			"network", "phone", "ringer", "screen", "security", "sound"];
	}

	if(this.extensions.triggers.length == 0) {
		this.extensions.triggers = ["application", "battery", "bluetooth", "calevent", "charger", 
				"display", "headset", "interval", "location", "modechange", "silentsw", 
				"timeofday", "wireless"];
	}

	// Load extensions

	delete this.extensionModules;
	this.extensionModules = {actions: {}, settings: {}, triggers: {}};
	
	for(var i = 0; i < this.extensions.actions.length; i++) {
		var className = this.extensions.actions[i].charAt(0).toUpperCase() + this.extensions.actions[i].slice(1);

		this.extensionModules.actions[this.extensions.actions[i]] = eval("new " + className + "Actions(this.controller);");
	}

	for(var i = 0; i < this.extensions.settings.length; i++) {
		var className = this.extensions.settings[i].charAt(0).toUpperCase() + this.extensions.settings[i].slice(1);

		this.extensionModules.settings[this.extensions.settings[i]] = eval("new " + className + "Settings(this.controller);");
	}
 
	for(var i = 0; i < this.extensions.triggers.length; i++) {
		var className = this.extensions.triggers[i].charAt(0).toUpperCase() + this.extensions.triggers[i].slice(1);

		this.extensionModules.triggers[this.extensions.triggers[i]] = eval("new " + className + "Triggers(this.controller);");
	}

	// Loading of prefs is now done

	this.loading = false;

	// Check for need of initial default mode setup
	
	if((this.appAssistant.isNewOrFirstStart == 1) || (this.customModes.length == 0)) {
		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.srv", {
			method: 'prefs', parameters: {extensions: this.extensions},
			onSuccess: function() {
				this.controller.showAlertDialog({
					title: $L("Enable Advanced Features?"),
					message: "<div align='justify'>" + 
						$L("You need to have <b>Advanced System Prefs</b> patches installed before enabling advanced features! " +
						"You can change this setting later by selecting <b>Extensions</b> from the app menu. " +
						"Advanced features enables calendar / messaging / email settings and charger / battery triggers.") + "</div>",
					choices:[{label:$L("Yes"), value:true, type:'affirmative'},{label:$L("No"), value:false, type:'negative'}],
					preventCancel: true,
					allowHTMLMessage: true,
					onChoose: function(value) {
						var cookie = new Mojo.Model.Cookie('preferences');

						cookie.put({ 'advancedPrefs': value });

						this.appAssistant.isNewOrFirstStart = 0;
						
						if(this.customModes.length == 0) {
							this.customModes.push({ 
								'name': "Default Mode", 'type': "default", 'startup': 0, 'start': 1, 'notify': 2, 
								'actions': {'start': 0, 'close': 0, 'list': []}, 'settings': [], 'triggers': [] });
					
							this.controller.showAlertDialog({
								title: $L("Initial setup of Mode Switcher!"),
								message: "<div align='justify'>" + 
									$L("<i>Mode Switcher</i> needs to retrieve your current system settings for <i>Default Mode</i>. " +
									"This operation should only take few seconds to finish. You can modify the <i>Default Mode</i> " +
									"afterwards by clicking the <i>Edit Default Mode</i> button.") + "</div>",
								choices:[{label:$L("Continue"), value:"ok", type:'default'}],
								preventCancel: true,
								allowHTMLMessage: true,
								onChoose: function(advancedPrefs, value) {
									this.retrieveCurrentSettings(0, "everything", advancedPrefs);
								}.bind(this, value)}); 
						}
					}.bind(this)}); 
			}.bind(this),
			onFailure: this.unknownServiceError.bind(this)});					
	}
	else {
		// Check if entering straightly to editing mode was requested

		if((this.params) && (this.params.name != undefined)) {
			for(var i = 0; i < this.customModes.length; i++) {
				if(this.customModes[i].name == this.params.name) {
					this.controller.stageController.pushScene("mode", this.apiVersion, this.cfgVersion, 
						this.extensions, this.extensionModules, this.customModes, i);

					this.params = null;
				
					break;
				}
			}
		}
	}
}

//

MainAssistant.prototype.retrieveCurrentSettings = function(index, target, advancedPrefs) {
	if(index == 0) {
		Mojo.Log.info("Retrieving current system settings");

		this.controller.get("overlay-scrim").show();

		this.modelWaitSpinner.spinning = true;
		
		this.controller.modelChanged(this.modelWaitSpinner, this);

		this.appControl.showBanner($L("Retrieving current system settings"), {});
	}

	if(index < this.extensions.settings.length) {
		if((advancedPrefs == true) || 
			(this.extensionModules.settings[this.extensions.settings[index]].basic() == true))
		{
			Mojo.Log.info("Retrieving " + this.extensions.settings[index] + " settings");

			var callback = this.retrievedCurrentSettings.bind(this, index, target, advancedPrefs);

			this.extensionModules.settings[this.extensions.settings[index]].fetch(callback);
		}
		else {
			this.retrieveCurrentSettings(++index, target, advancedPrefs);
		}		
	}
	else {
		this.customModes[0].settings.sort(this.sortAlphabeticallyFunction);

		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.srv", {
			method: 'prefs', parameters: {customModes: this.customModes},
			onSuccess: function() {
				Mojo.Log.info("Retrieving system settings finished");

				this.modelWaitSpinner.spinning = false;
		
				this.controller.modelChanged(this.modelWaitSpinner, this);

				this.controller.get("overlay-scrim").hide();

				this.appControl.showBanner($L("Retrieving system settings finished"), {});
			}.bind(this),
			onFailure: this.unknownServiceError.bind(this)});
	}
}

MainAssistant.prototype.retrievedCurrentSettings = function(index, target, advancedPrefs, settings) {
	if(settings != undefined) {
		var data = this.extensionModules.settings[this.extensions.settings[index]].save(settings);	
	
		data.extension = this.extensions.settings[index];

		this.customModes[0].settings.push(data);

		this.customModes[0].settings.sort(this.sortAlphabeticallyFunction);
	}

	this.retrieveCurrentSettings(++index, target, advancedPrefs);
}

//

MainAssistant.prototype.toggleModeSwitcher = function(event) {
	if(this.loading) {
		if(this.modelActivatedButton.value)
			this.modelActivatedButton.value = false;
		else
			this.modelActivatedButton.value = true;

		this.controller.modelChanged(this.modelActivatedButton, this);

		return;
	}

	if((event.up) && (event.up.altKey)) {
		if(!this.modelActivatedButton.value)
			return;

		this.loading = true;

		if(this.modeLocked) {
			this.modeLocked = false;
		
			this.controller.get("StatusText").innerHTML = "Activated";
		
		 	this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.srv", {
				method: 'control', parameters: {action: "unlock"},
				onSuccess: function() { this.loading = false; }.bind(this),
				onFailure: this.unknownServiceError.bind(this)});
		}
		else {
			this.modeLocked = true;

			this.controller.get("StatusText").innerHTML = "Activated & Locked";

		 	this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.srv", {
				method: 'control', parameters: {action: "lock"},
				onSuccess: function() { this.loading = false; }.bind(this),
				onFailure: this.unknownServiceError.bind(this)});
		}
	}
	else {
		this.loading = true;

		this.controller.get("StatusText").innerHTML = "Activated";

		if(this.modelActivatedButton.value) {
			this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.srv", {
				method: 'control', parameters: {action: "enable"},
				onSuccess: function() {
					this.loading = false;
				
					this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.srv", {
						method: 'execute', parameters: {action: "start", name: "Default Mode"}});
				}.bind(this),
				onFailure: this.unknownServiceError.bind(this)});
		}
		else {
			this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.srv", {
				method: 'control', parameters: {action: "disable"},
				onSuccess: function() {
					this.loading = false;
				}.bind(this),
				onFailure: this.unknownServiceError.bind(this)});					
		}		
	}
}

//

MainAssistant.prototype.setTimerPreferences = function(event) {
	this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.srv", {
			method: 'prefs', parameters: {
				startTimer: this.modelStartSelector.value * 1000,
				closeTimer: this.modelCloseSelector.value * 1000},
			onFailure: this.unknownServiceError.bind(this)});
}

//

MainAssistant.prototype.handleModesListTap = function(event) {
	if(this.loading)
		return;

	var index = event.model.items.indexOf(event.item);
	
	if((event.originalEvent.up) && (event.originalEvent.up.altKey)) {
		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.srv", { 
			'method': "execute", 'parameters': {'action': "toggle", 'name': this.customModes[index + 1].name},
			onFailure: this.unknownServiceError.bind(this)});
	}
	else if (index >= 0)
		this.controller.stageController.pushScene("mode", this.apiVersion, this.cfgVersion, 
			this.extensions, this.extensionModules, this.customModes, index + 1);
}

MainAssistant.prototype.handleModesListReorder = function(event) {
	if(this.loading) {
		this.controller.modelChanged(this.modelModesList, this);
	
		return;
	}

	var tempMode = this.customModes[event.fromIndex + 1];
	
	this.customModes.splice(event.fromIndex + 1, 1);
	this.customModes.splice(event.toIndex + 1, 0, tempMode);

	tempMode = this.modelModesList.items[event.fromIndex];

	this.modelModesList.items.splice(event.fromIndex, 1);
	this.modelModesList.items.splice(event.toIndex, 0, tempMode);

	this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.srv", {
		method: 'prefs', parameters: {customModes: this.customModes},
		onFailure: this.unknownServiceError.bind(this)});
}

MainAssistant.prototype.handleRemoveModeFromList = function(event) {
	var modeName = this.customModes[event.index + 1].name;
	
	var modeActions = [], modeTriggers = [];

	// If loading then don't allow deleting of modes and refresh the list.

	if(this.loading) {
		this.controller.modelChanged(this.modelModesList, this);
	
		return;
	}

	// Check if the mode exist in other mode configurations and notify user if it does.

	for(var i = 0; i < this.customModes.length; i++) {
		if(i != (event.index + 1)) {
			for(var j = 0; j < this.customModes[i].actions.list.length; j++) {
				if((this.customModes[i].actions.list[j].type == "ms") &&
					(this.customModes[i].actions.list[j].mode == modeName))
				{
					modeActions.push({modeIndex: i, actionIndex: j});
				}
			}
			
			for(var j = 0; j < this.customModes[i].triggers.length; j++) {
				for(var k = 0; k < this.customModes[i].triggers[j].list.length; k++) {					
					if((this.customModes[i].triggers[j].list[k].extension == "modechange") &&
						(this.customModes[i].triggers[j].list[k].mode == modeName))
					{
						modeTriggers.push({modeIndex: i, groupIndex: j, triggerIndex: k});
					}
				}
			}
		}
	}

	if((modeActions.length == 0) && (modeTriggers.length == 0)) {
		this.customModes.splice(event.index + 1, 1);

		this.modelModesList.items.splice(event.index, 1);

		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.srv", {
			method: 'prefs', parameters: {customModes: this.customModes},
			onFailure: this.unknownServiceError.bind(this)});
	}
	else {
		this.controller.showAlertDialog({
			title: $L("Mode References Exists!"),
			message: "Other modes have actions or triggers referring this mode, are you sure you want to delete this mode?",
			choices:[
				{label:$L("Delete Mode & References"), value:"delete", type:'default'},
				{label:$L("Cancel Mode Deleting"), value:"cancel", type:'default'}],
			preventCancel: true,
			allowHTMLMessage: true,
			onChoose: function(value) {
				if(value == "delete") {
					for(var i = 0; i < modeActions.length; i++) {
						var modeIdx = modeActions[i].modeIndex;
						var actionIdx = modeActions[i].actionIndex;
						
						this.customModes[modeIdx].actions.list.splice(actionIdx, 1);
					}

					for(var i = 0; i < modeTriggers.length; i++) {
						var modeIdx = modeTriggers[i].modeIndex;
						var groupIdx = modeTriggers[i].groupIndex;
						var triggerIdx = modeTriggers[i].triggerIndex;
						
						this.customModes[modeIdx].triggers[groupIdx].list.splice(triggerIdx, 1);
						
						if(this.customModes[modeIdx].triggers[groupIdx].list.length == 0)
							this.customModes[modeIdx].triggers.splice(groupIdx, 1);
					}
				
					this.customModes.splice(event.index + 1, 1);

					this.modelModesList.items.splice(event.index, 1);

					this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.srv", {
						method: 'prefs', parameters: {customModes: this.customModes},
						onFailure: this.unknownServiceError.bind(this)});
				}
				else
					this.controller.modelChanged(this.modelModesList, this);
			}.bind(this)}); 
	}
}

MainAssistant.prototype.handleAddModeButtonPress = function(event) {
	if(this.loading)
		return;

	if((event.up) && (event.up.altKey)) {
		if(this.customModes.length > 1)
			this.customModes.splice(1, this.customModes.length - 1);		
			
		this.modelModesList.items.clear();

		this.controller.modelChanged(this.modelModesList, this);

		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.srv", {
			method: 'prefs', parameters: {customModes: this.customModes},
			onFailure: this.unknownServiceError.bind(this)});
	}
	else {
		this.controller.stageController.pushScene("mode", this.apiVersion, this.cfgVersion, 
			this.extensions, this.extensionModules, this.customModes);
	}
}

MainAssistant.prototype.handleDefModeButtonPress = function(event) {
	if(this.loading)
		return;

	if((event.up) && (event.up.altKey)) {
		var id = this.customModes[0]._id;
	
		this.customModes[0] = {'_id': id, 
			'name': "Default Mode", 'type': "default", 'startup': 0, 'start': 1, 'notify': 2, 
			'actions': {'start': 0, 'close': 0, 'list': []}, 'settings': [], 'triggers': []
		};
			
		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.srv", {
			method: 'prefs', parameters: {customModes: this.customModes},
			onFailure: this.unknownServiceError.bind(this)});
	}
	else {
		this.controller.stageController.pushScene("mode", this.apiVersion, this.cfgVersion, 
			this.extensions, this.extensionModules, this.customModes, 0);
	}
}

MainAssistant.prototype.unknownServiceError = function(response) {
	this.loading = false;

	this.modelWaitSpinner.spinning = false;
	
	this.controller.modelChanged(this.modelWaitSpinner, this);

	this.controller.get("overlay-scrim").hide();

	this.controller.showAlertDialog({
		title: $L("Unknown Service Error!"),
		message: "<div align='justify'>" + $L("<i>Mode Switcher</i> service not responding. This might be because of installation problem or even a bug. See wiki and forum for more info.") + "</div>",
		choices:[{label:$L("Continue"), value:"ok", type:'default'}],
		preventCancel: true,
		allowHTMLMessage: true}); 
}

MainAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.back) {
		this.controller.stageController.deactivate();		
	}
	else if(event.type == Mojo.Event.command) {
		if(event.command == "prefs") {
			this.controller.stageController.pushScene("prefs", this.extensions, this.preferences);
		}
		else if(event.command == "export") {
			this.controller.get("overlay-scrim").show();

			this.modelWaitSpinner.spinning = true;
		
			this.controller.modelChanged(this.modelWaitSpinner, this);

			this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.srv", {
				method: 'prefs', parameters: {keys: ["cfgVersion", "customModes"]}, 
				onSuccess: function(response) {
					if((response) && (response.cfgVersion) && (response.customModes)) {
						var document = {version: response.cfgVersion, modes: response.customModes}
						
						for(var i = 0; i < document.modes.length; i++){
							for(var j = 0; j < document.modes[i].settings.length; j++) {
								var ext = document.modes[i].settings[j].extension;
								
								var module = this.extensionModules.settings[ext];

								if(module != undefined)
									module.export(document.modes[i].settings[j]);
								else
									document.modes[i].settings.splice(j, 1);
							}
						}
						
						this.modelWaitSpinner.spinning = false;
		
						this.controller.modelChanged(this.modelWaitSpinner, this);

						this.controller.get("overlay-scrim").hide();

						this.controller.stageController.pushScene("gdm", "exportGDoc", "All Modes", 
							"[MSCFG] *", {'title': "Mode Switcher - All Modes", 'body': document}, null);
					}
				}.bind(this),
				onFailure: this.unknownServiceError.bind(this)});
		}
		else if(event.command == "import") {
			this.controller.stageController.pushScene("gdm", "importGDoc", "All Modes", 
				"[MSCFG] *", null, this.importAllModes.bind(this));
		}
		else if(event.command == "status") {
			this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.srv", {
				method: 'status', parameters: {},
				onSuccess: function(response) {
					if((response) && (response.activeModes)) {
						var text = "";
			
						if(response.activeModes.length == 0)
							text += "Mode Switcher is not activated.";
						else {
							text += "<div style='float:left;'><b>Current Mode:</b></div><div style='float:right;'>" + response.activeModes[0].name + "</div><br><br>";

							text += "<div style='float:left;'><b>Modifier Modes:</b></div><div style='float:right;'>" + (response.activeModes.length - 1) + " Active</div><br>";
				
							if(response.activeModes.length > 0) {
								text += "<br>";
					
								for(var i = 1; i < response.activeModes.length; i++) {
									text += response.activeModes[i].name;
						
									if(i < (response.activeModes.length - 1))
										text += ", ";
								}
							}
						}

						this.controller.showAlertDialog({
							title: $L("Mode Switcher Status"),
							message: text,
							choices:[
								{label:$L("Close"), value:"close", type:'default'}],
							preventCancel: true,
							allowHTMLMessage: true,
							onChoose: function(value) {
							}.bind(this)}); 

					}
				}.bind(this),
				onFailure: this.unknownServiceError.bind(this)});
		}		
		else if(event.command == "help") {
			this.controller.stageController.pushScene("support", this.customModes);
		}
	}
}

MainAssistant.prototype.importAllModes = function(data) {
	if((data.body.version != this.cfgVersion) || (data.body.modes == undefined)) {
		this.controller.showAlertDialog({
			title: $L("Configuration Version Error"),
			message: "The version of the modes configuration that you are trying to import is not supported.",
			choices:[
				{label:$L("Close"), value:"close", type:'default'}],
			preventCancel: true,
			allowHTMLMessage: true,
			onChoose: function(value) {
			}.bind(this)}); 
	}
	else {
		this.controller.showAlertDialog({
			title: $L("Select Modes for Importing"),
			choices:[
				{label:$L("Import All Modes"), value:"all", type:'default'},
				{label:$L("Only Import Default Mode"), value:"default", type:'default'},
				{label:$L("Only Import Custom Modes"), value:"custom", type:'default'}],
			preventCancel: false,
			allowHTMLMessage: true,
			onChoose: function(modes, value) {
				if(value == "custom")
					modes.splice(0, 1);
				else if(value == "default")
					modes.splice(1, modes.length - 1);					
			
				if(value) {
					this.controller.get("overlay-scrim").show();

					this.modelWaitSpinner.spinning = true;

					this.controller.modelChanged(this.modelWaitSpinner, this);
				
					this.importModeConfig(modes, 0, 0);
				}
			}.bind(this, data.body.modes)});
	}
}

MainAssistant.prototype.importModeConfig = function(modes, modeIdx, settingsIdx, error) {
	if((modeIdx == modes.length) || (error)) {
		this.modelModesList.items.clear();

		for(var i = 1; i < this.customModes.length; i++)
			this.modelModesList.items.push(this.customModes[i]);

		this.controller.modelChanged(this.modelModesList, this);

		this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.srv", {
			method: 'prefs', parameters: {'customModes': this.customModes},
			onSuccess: function(error, response) {
				this.modelWaitSpinner.spinning = false;

				this.controller.modelChanged(this.modelWaitSpinner, this);

				this.controller.get("overlay-scrim").hide();
				
				if(error) {
					this.controller.showAlertDialog({
						title: $L("Configuration Import Error"),
						message: "<div align='justify'>There was error while importing mode configuration, most likely the configuration you tried to import was malformed.</div>",
						choices:[
							{label:$L("Close"), value:"close", type:'default'}],
						preventCancel: true,
						allowHTMLMessage: true,
						onChoose: function(value) {
						}.bind(this)}); 
				}
			}.bind(this, error),
			onFailure: this.unknownServiceError.bind(this)});
	}
	else {
		if((settingsIdx == 0) && (!this.importModeCheck(modes, modeIdx))) {
			this.importModeConfig(modes, modes.length, 0, "Malformed configuration.");		
		}
		else {
			if(modes[modeIdx].settings.length == settingsIdx) {
				if(modes[modeIdx].type == "default") {
					if(this.customModes[0]._id != undefined)
						var id = this.customModes[0]._id;
		
					this.customModes.splice(0, 1, modes[modeIdx]);
			
					if(id != undefined)
						this.customModes[0]._id = id;
				}
				else {
					var index = this.customModes.search("name", modes[modeIdx].name);
				
					if(index != -1) {
						if(this.customModes[index]._id != undefined)
							var id = this.customModes[index]._id;
		
						this.customModes.splice(index, 1, modes[modeIdx]);
			
						if(id != undefined)
							this.customModes[index]._id = id;
					}
					else
						this.customModes.push(modes[modeIdx]);								
				}

				this.importModeConfig(modes, ++modeIdx, 0);
			}
			else {
				var ext = modes[modeIdx].settings[settingsIdx].extension;
			
				var module = this.extensionModules.settings[ext];

				if(module != undefined) {
					module.import(modes[modeIdx].settings[settingsIdx], 
						this.importModeConfig.bind(this, modes, modeIdx, ++settingsIdx));
				}
				else {
					modes[modeIdx].settings.splice(settingsIdx, 1);
				
					this.importModeConfig(modes, modeIdx, ++settingsIdx);
				}
			}
		}
	}
}

MainAssistant.prototype.importModeCheck = function(modes, modeIdx) {
	if((modes[modeIdx].name == undefined) || (modes[modeIdx].type == undefined) ||
		(modes[modeIdx].name.length == 0) || (modes[modeIdx].name == "Current Mode") ||
		((modes[modeIdx].name == "Default Mode") && (modes[modeIdx].type != "default")) ||
		(modes[modeIdx].name == "Previous Mode") || (modes[modeIdx].name == "All Modes") || 
		(modes[modeIdx].name == "Any Normal Mode") || (modes[modeIdx].name == "Any Modifier Mode") ||
		(modes[modeIdx].name == "All Normal Modes") || (modes[modeIdx].name == "All Modifier Modes"))
	{
		return false;
	}

	if((modes[modeIdx].actions == undefined) || (modes[modeIdx].actions.list == undefined) || 
		(modes[modeIdx].actions.start == undefined) || (modes[modeIdx].actions.close == undefined) || 
		(modes[modeIdx].settings == undefined) || (modes[modeIdx].triggers == undefined))
	{
		return false;
	}

	if((modes[modeIdx].type == "default") && (modes[modeIdx].startup != undefined) && 
		(modes[modeIdx].start != undefined) && (modes[modeIdx].notify != undefined))
	{
		modes[modeIdx].name = "Default Mode";
		
		return true;
	}

	if(((modes[modeIdx].type == "normal") || (modes[modeIdx].type == "modifier")) && 
		(modes[modeIdx].start != undefined) && (modes[modeIdx].close != undefined) && 
		(modes[modeIdx].notify != undefined))
	{
		if(this.customModes.search("name", modes[modeIdx].name) != -1)
			modes[modeIdx].name = modes[modeIdx].name + " (I)";
		
		return true;
	}

	return false;
}

//

MainAssistant.prototype.sortAlphabeticallyFunction = function(a,b){
	if(a.extension != undefined) {
		var c = a.extension.toLowerCase();
		var d = b.extension.toLowerCase();
	}

	return ((c < d) ? -1 : ((c > d) ? 1 : 0));
}

//

MainAssistant.prototype.activate = function(event) {
	/* Put in event handlers here that should only be in effect when this scene is active. 
	 *	For  example, key handlers that are observing the document. 
	 */

	// Check status and setup preference subscriptions for Mode Switcher service.
	
	this.loading = true;

	this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.srv", {
		method: 'prefs', parameters: {keys: ["activated", "modeLocked", "apiVersion", "cfgVersion",  
			"startTimer", "closeTimer", "activeModes", "customModes", "extensions", "preferences"]}, 
		onSuccess: this.updatePreferences.bind(this),
		onFailure: this.unknownServiceError.bind(this)});
}
	
MainAssistant.prototype.deactivate = function(event) {
	/* Remove any event handlers you added in activate and do any other cleanup that should 
	 * happen before this scene is popped or another scene is pushed on top. 
	 */
}

MainAssistant.prototype.cleanup = function(event) {
	/* This function should do any cleanup needed before the scene is destroyed as a result
	 * of being popped off the scene stack.
	 */ 

 	this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.srv", {
		method: 'control', parameters: {action: "reload", name: "Current Mode"}});
}

