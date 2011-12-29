function PrefsAssistant(extensions, preferences) {
	this.extensions = extensions;
	this.preferences = preferences;

	this.currentView = "main";
	
	this.settingsPrefs = [];
	this.triggersPrefs = [];
	
	for(var i = 0; i < this.extensions.settings.length; i++) {
		var id = this.extensions.settings[i];
		var title = id.charAt(0).toUpperCase() + id.slice(1);
	
		var force = false;
	
		if(this.preferences.settings[id])
			force = this.preferences.settings[id].force;
	
		this.settingsPrefs.push({'extension': id, 'title': title, 'force': force});
	}

	for(var i = 0; i < this.extensions.triggers.length; i++) {
		var id = this.extensions.triggers[i];
		var title = id.charAt(0).toUpperCase() + id.slice(1);
			
		var delay = 0;

		if(this.preferences.triggers[id])
			delay = this.preferences.triggers[id].delay;
			
		this.triggersPrefs.push({'extension': id, 'title': title, 'delay': delay});
	}
}

//

PrefsAssistant.prototype.setup = function() {
	this.loadPreferences();

	this.modelAdvancedButton = { value: this.prefs.advancedPrefs, disabled: false };

	this.controller.setupWidget("AdvancedSettingsButton", 
		{falseValue: false, falseLabel: $L("Off"), trueValue: true, trueLabel: $L("On")},
      this.modelAdvancedButton);

	Mojo.Event.listen(this.controller.get('AdvancedSettingsButton'), 
		Mojo.Event.propertyChange, this.advancedInfo.bind(this));

	this.modelSettingsButton = {buttonClass: '', disabled: false};

	this.controller.setupWidget('SettingsPrefsButton', 
		{label: $L("Setting Extensions")}, this.modelSettingsButton);

	Mojo.Event.listen(this.controller.get('SettingsPrefsButton'), 
		Mojo.Event.tap, this.changeView.bind(this, "Settings"));
		
	this.modelActionsButton = {buttonClass: '', disabled: true};

	this.controller.setupWidget('ActionsPrefsButton', 
		{label: $L("Action Extensions")}, this.modelActionsButton);

	this.modelTriggersButton = {buttonClass: '', disabled: true};

	this.controller.setupWidget('TriggersPrefsButton', 
		{label: $L("Trigger Extensions")}, this.modelTriggersButton);

	Mojo.Event.listen(this.controller.get('TriggersPrefsButton'), 
		Mojo.Event.tap, this.changeView.bind(this, "Triggers"));

	this.modelSettingsList = {items: this.settingsPrefs, disabled: false};

	this.controller.setupWidget("SettingsList", {
		itemTemplate: 'templates/settings-item',
		swipeToDelete: false, reorderable: false},
		this.modelSettingsList);

	Mojo.Event.listen(this.controller.get('SettingsList'), 
		Mojo.Event.propertyChange, this.saveExtensionPrefs.bind(this));

	this.controller.setupWidget("SettingsForcedToggle", {
		modelProperty: "force"});

	this.modelTriggersList = {items: this.triggersPrefs, disabled: false};
	
	this.controller.setupWidget("TriggersList", {
		itemTemplate: 'templates/triggers-item',
		swipeToDelete: false, reorderable: false},
		this.modelTriggersList);

	Mojo.Event.listen(this.controller.get('TriggersList'), 
		Mojo.Event.propertyChange, this.saveExtensionPrefs.bind(this));	

	this.controller.setupWidget("TriggersDelaysPicker", {
		min: 0, max: 30, label: ' ', modelProperty: "delay"});

	this.controller.listen(this.controller.get('help-toggle'), Mojo.Event.tap, this.helpButtonTapped.bindAsEventListener(this));

	this.controller.listen(this.controller.get('SettingsForcedHelp'), Mojo.Event.tap, this.helpItemTapped.bindAsEventListener(this, "settings"));

	this.controller.listen(this.controller.get('TriggersDelaysHelp'), Mojo.Event.tap, this.helpItemTapped.bindAsEventListener(this, "triggers"));
}

PrefsAssistant.prototype.advancedInfo = function(event) {
	if(this.modelAdvancedButton.value) {
		this.controller.showAlertDialog({
			title: $L("Advanced Features"),
				message: "<div align='justify'>" + 
					$L("Make sure that you have installed all <b>Advanced System Prefs</b> patches before enabling this option! See the wiki for details about the required patches!") + "<br><br>" +
					$L("You can install <b>Uber Calendar</b> patch instead of <b>Advanced System Prefs - Calendar Prefs</b> patch if you want.") + "</div>",
				choices:[{label:$L("Continue"), value:"ok", type:'default'}, {label:$L("Cancel"), value:"cancel", type:'default'}],
				preventCancel: true,
				allowHTMLMessage: true,
				onChoose: function(value) {
					if(value == "cancel")
						this.modelAdvancedButton.value = false;
					else 
						this.modelAdvancedButton.value = true;
					
					this.controller.modelChanged(this.modelAdvancedButton, this);
					
					this.savePreferences();
				}.bind(this)}); 
	}
	else
		this.savePreferences();
}

PrefsAssistant.prototype.changeView = function(view) {
	this.currentView = view.toLowerCase();
	
	this.controller.get("mainView").hide();

	this.controller.get(this.currentView + "View").show();	
	
	this.controller.get("title").update("Extensions - " + view);
	
	this.controller.get("prefs").className = "config";
	
	
}

PrefsAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.back) {
		event.stop();

		if(this.currentView != "main") {
			this.currentView = "main";
	
			this.controller.get("settingsView").hide();
			this.controller.get("triggersView").hide();

			this.controller.get("mainView").show();

			this.controller.get("prefs").className = "prefs";
	
			this.controller.get("title").update("Extensions");
		}
		else
			this.controller.stageController.popScene();
	}
}

PrefsAssistant.prototype.helpButtonTapped = function(event)
{
	if(this.controller.get('prefs').hasClassName('help')) {
		this.controller.get('prefs').removeClassName('help');
		event.target.removeClassName('selected');
	}
	else {
		this.controller.get('prefs').addClassName('help');
		event.target.addClassName('selected');
	}
}

PrefsAssistant.prototype.helpItemTapped = function(event, item) {
	if(item == "settings") {
		this.controller.showAlertDialog({
			title: "Forced Settings Applying",
			message: "<div style='text-align:justify;'>" +
				"Normal behavior is that only settings that differ between old and new modes are applied. " +
				"If settings that are same in both modes are changed manually between the mode changes they are not changed by Mode Switcher. " +
				"When forced applying is enabled the settings are applied in every situation.<br><br>" +
				"<b>NOTE:</b> Forced applying makes mode changes more 'heavier' so enable it only when really needed." + "</div>",
			choices:[{"label": "Close", "command": "close"}],
			preventCancel: false,
			allowHTMLMessage: true
		});
	}
	else if(item == "triggers") {
		this.controller.showAlertDialog({
			title: "Mode Changing Delays",
			message: "<div style='text-align:justify;'>" +
				"Normal behavior is that when trigger event happens the mode changing is initiated immeadiately. " +
				"With delay time the mode changing is delayed and if the same trigger happens within that time the previous triggers is ignored. " +
				"This is useful with triggers such as wireless trigger when you don't want short disconnections initiate a mode changing.<br><br>" +
				"<b>NOTE:</b> The delay is not used when the trigger event only starts mode(s)." + "</div>",
			choices:[{"label": "Close", "command": "close"}],
			preventCancel: false,
			allowHTMLMessage: true
		});
	}	
}

PrefsAssistant.prototype.saveExtensionPrefs = function() {
	for(var i = 0; i < this.settingsPrefs.length; i++) {
		if(this.preferences.settings[this.settingsPrefs[i].extension] == undefined)
			this.preferences.settings[this.settingsPrefs[i].extension] = {};
	
		this.preferences.settings[this.settingsPrefs[i].extension].force = this.settingsPrefs[i].force;
	}

	for(var i = 0; i < this.triggersPrefs.length; i++) {
		if(this.preferences.triggers[this.triggersPrefs[i].extension] == undefined)
			this.preferences.triggers[this.triggersPrefs[i].extension] = {};
	
		this.preferences.triggers[this.triggersPrefs[i].extension].delay = this.triggersPrefs[i].delay;
	}

	this.controller.serviceRequest("palm://org.e.lnx.wee.modeswitcher.srv", {
		method: 'prefs', parameters: {preferences: this.preferences}});
}

PrefsAssistant.prototype.loadPreferences = function() {
	this.cookie = new Mojo.Model.Cookie('preferences');

	this.prefs = this.cookie.get();
	
	if(!this.prefs) {
		this.prefs = { 'advancedPrefs': false };
	}
}

PrefsAssistant.prototype.savePreferences = function() {
	this.prefs.advancedPrefs = this.modelAdvancedButton.value;
	
	this.cookie.put(this.prefs);
}

//

PrefsAssistant.prototype.cleanup = function() {
}

//

PrefsAssistant.prototype.activate = function() {
}

PrefsAssistant.prototype.deactivate = function() {
}

