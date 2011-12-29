function StartupAssistant() {
	this.appControl = Mojo.Controller.getAppController();
	this.appAssistant = this.appControl.assistant;

	this.firstMessage = $L(
		"<center><b>Here are some basic info for new users:</b></center><br><ul>" +
		"<li>On first start <i>Mode Switcher</i> will fetch your current settings into <i>Default Mode</i> which is activated when no other mode is active</li>" +
		"<li>You can create basic <i>Normal Modes</i> and special <i>Modifier Modes</i> which can be activated manually or set to activate automatically</li>" + 
		"<li>Only one <i>Normal Mode</i> can be active at once and it overrides settings from <i>Default Mode</i>, name of the mode is shown in Top Bar</li>" +
		"<li>Multiple <i>Modifier Modes</i> can be active at once and they override settings from <i>Normal Modes</i>, indicated with '+' sign in Top Bar</li>" +
		"<li>The Top Bar information is enabled by <i>System Menus - Framework / Mode Menu</i> patches, available from Preware (both are required)</li>"+ 
		"</ul>");
	
	this.secondMessage = $L("Please consider making a <a href=\"https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=7A4RPR9ZX3TYS&lc=FI&item_name=Mode%20Switcher%20Application&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted\">donation</a> if you wish to show your appreciation.");

	this.newMessages = [
	{
		version: '2.5.5', log: [
			'Fixed one bug when used on 2.2.4, more fixes coming.'
		]
	},
	{
		version: '2.5.4', log: [
			'Fixed bug in mode executing and trigger processing.'
		]
	},
	{
		version: '2.5.3', log: [
			'More fixes for modes export/import, should work now.'
		]
	},
	{
		version: '2.5.2', log: [
			'Fixed modes importing to work on all webOS versions.'
		]
	},
	{
		version: '2.5.0', log: [
			'Fixed modes exporting on Pre3 and small fix for wireless trigger.'
		]
	},
	{
		version: '2.4.6', log: [
			'Triggers should now work better and be much more reliable than before.'
		]
	},
	{
		version: '2.4.2', log: [
			'Fixed typo and wallpaper config for Pre3, re-config wallpapers!'
		]
	},
	{
		version: '2.4.1', log: [
			'Fixed wireless trigger and added fix for the UI on Pre3.'
		]
	},
	{
		version: '2.4.0', log: [
			'Fixed a small problem that caused fetching of settings fail on Pre3.'
		]
	},
	{
		version: '2.3.9', log: [
			'Fixed a normal modes changing bug when triggered at the same time.'
		]
	},
	{
		version: '2.3.8', log: [
			'Fixed a bug that made settings fetching fail on Veer.'
		]
	},
	{
		version: '2.3.7', log: [
			'Fixed a bug that caused an error in certain rare situations.'
		]
	},
	{
		version: '2.3.6', log: [
			'Fixed calendar event trigger and few other bugs, see wiki for details.'
		]
	},
	{
		version: '2.3.5', log: [
			'New bluetooth trigger implementation, should now work much better.'
		]
	},
	{
		version: '2.3.4', log: [
			'New group based trigger configuration and possibility to share modes, see wiki for details.',
			'<b>Re-export your modes after upgrading, importing of modes that has been exported with older versions is not supported.</b>'
		]
	},
	{
		version: '2.3.3', log: [
			'Fixed bug in applying settings and fine tuned bluetooth trigger.'
		]
	},
	{
		version: '2.3.2', log: [
			'Fixed couple bugs regarding the service, see wiki for details.'
		]
	},
	{
		version: '2.3.1', log: [
			'Fixed the security unsecure settings not taking effect.'
		]
	},
	{
		version: '2.3.0', log: [
			'Many changes and additions to the core functionality, see wiki for details.'
		]
	},
	{
		version: '2.2.5', log: [
			'Fixed email and messaging settings not working bug.'
		]
	},
	{
		version: '2.2.4', log: [
			'Fixed two bugs related to mode actions, see wiki for details.'
		]
	},
	{
		version: '2.2.3', log: [
			'Fixed bug that caused initial configuration to fail on new installs.'
		]
	},
	{
		version: '2.2.2', log: [
			'Fixed few bugs introduced in 2.2.0 release, see wiki for details.'
		]
	},
	{
		version: '2.2.1', log: [
			'Fixed extensions name collision bug.'
		]
	},
	{
		version: '2.2.0', log: [
			'New extensions and features, see wiki for details.'
		]
	},
	{
		version: '2.1.3', log: [
			'Couple small bug fixes, see wiki for details.'
		]
	},
	{
		version: '2.1.2', log: [
			'Bug fixes for the application side, see wiki for details.'
		]
	},
	{
		version: '2.1.1', log: [
			'Removed buggy and unneeded options from mode trigger.'
		]
	},
	{
		version: '2.1.0', log: [
			'First public release of Mode Switcher 2.x, see wiki for more information.'
		]
	},
	{
		version: '2.0.9', log: [
			'Small UI change and removed the unneeded trigger blocking setting.'
		]
	},
	{
		version: '2.0.8', log: [
			'Cleanups for the app and few functional changes, see wiki for details.'
		]
	},
	{
		version: '2.0.7', log: [
			'Fixed modifier modes getting closed when closing mode bug.'
		]
	},
	{
		version: '2.0.6', log: [
			'Couple small bug fixes, see wiki for details.'
		]
	},
	{
		version: '2.0.5', log: [
			'Several bug fixes and few logic fixes, see wiki for details.'
		]
	},
	{
		version: '2.0.4', log: [
			'Small bug fixes, see wiki for details.'
		]
	},
	{
		version: '2.0.3', log: [
			'Small bug fix for bluetooth trigger and added new help system.'
		]
	},
	{
		version: '2.0.2', log: [
			'Bug fix release, fixed service not starting bug'
		]
	},
	{
		version: '2.0.1', log: [
			'Bug fix release, see wiki for details'
		]
	},
	{
		version: '2.0.0', log: [
			'<b>Requires WebOS 2.0.0 or newer to work!</b>',
			'Completely new service based version of Mode Switcher'
		]
	}];
	
	this.menuModel = {
		visible: true,
		items: [
			{ label: $L("Help"), command: 'help' } ]
	};
	
	this.cmdMenuModel =
	{
		visible: false, 
		items: [
		    {},
		    {
				label: $L("Ok, I've read this. Let's continue ..."),
				command: 'continue'
		    },
		    {} ]
	};
};

StartupAssistant.prototype.setup = function() {
	if(this.appAssistant.isNewOrFirstStart == 0)
		this.controller.get('title').innerHTML = $L('Changelog');
	else if(this.appAssistant.isNewOrFirstStart == 1) 
		this.controller.get('title').innerHTML = $L("Welcome To Mode Switcher");
	else if(this.appAssistant.isNewOrFirstStart == 2) 
		this.controller.get('title').innerHTML = $L("Mode Switcher Changelog");
	
	var html = '';

	if(this.appAssistant.isNewOrFirstStart == 0) {
		for(var m = 0; m < this.newMessages.length; m++) {
			html += Mojo.View.render({object: {title: 'v' + this.newMessages[m].version}, template: 'templates/changelog'});
			html += '<ul>';
			
			for(var l = 0; l < this.newMessages[m].log.length; l++)
				html += '<li>' + this.newMessages[m].log[l] + '</li>';

			html += '</ul>';
		}
	} 
	else {
		if(this.appAssistant.isNewOrFirstStart == 1)
			html += '<div class="text">' + this.firstMessage + '</div>';
	   
		if(this.appAssistant.isNewOrFirstStart != 0)
			html += '<div class="text">' + this.secondMessage + '</div>';

		for(var m = 0; m < this.newMessages.length; m++) {
			html += Mojo.View.render({object: {title: 'v' + this.newMessages[m].version}, template: 'templates/changelog'});
			html += '<ul class="changelog">';
			
			for(var l = 0; l < this.newMessages[m].log.length; l++)
				html += '<li>' + this.newMessages[m].log[l] + '</li>';

			html += '</ul>';
		}
	}

	this.controller.get('data').innerHTML = html;

	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	if(this.appAssistant.isNewOrFirstStart)
		this.controller.setupWidget(Mojo.Menu.commandMenu, { menuClass: 'no-fade' }, this.cmdMenuModel);
	
	this.controller.setDefaultTransition(Mojo.Transition.zoomFade);
};

StartupAssistant.prototype.activate = function(event) {
	this.timer = this.controller.window.setTimeout(this.showContinue.bind(this), 5 * 1000);
};

StartupAssistant.prototype.showContinue = function() {
	this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
};

StartupAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		if(event.command == 'continue')
			this.controller.stageController.swapScene({name: 'main', transition: Mojo.Transition.crossFade}, 'main', false);
		else if(event.command == 'help')		
			this.controller.stageController.pushScene("support");
	}
};

