enyo.kind({
	name: "Info",
	kind: enyo.VFlexBox,
	
	_profile: [{
		group: "Connection Settings", settings: [{
			label: "Wi-Fi Connection", value: "Enabled"
		}, {
			label: "Bluetooth Connection", value: "Disabled"
		}]
	}, {
		group: "Security Settings", settings: [{
			label: "Unlock Security", value: "None"
		}]
	}, {
		group: "Screen Settings", settings: [{
			label: "Screen Brightness", value: "100"
		}]
	}],
	
	_situation: [{
		label: "Charger Connected", value: "Wall"
	}, {
		label: "Time Of Day", value: "12:34"
	}, {
		label: "Wi-Fi Connected To", value: "Home"
	}],		
	
	_events: [{
		type: "modeChange", label: "Mode Started by Situation Event", details: "Music Mode / Listening Music", date: "04.06.11", time: "12:30:23"
	}, {
		type: "triggerEvent", label: "Trigger Received, Bluetooth", details: "Connected / Jabra HF / HFG", date: "04.06.11", time: "12:30:20"
	}, {
		type: "modeChange", label: "Mode Closed by Manual Change", details: "Outside Mode / User Initiated", date: "04.06.11", time: "12:15:00"
	}],
		
	components: [{
		name: "viewCurrent", flex: 1, components: [{
			kind: "PageHeader", layoutKind: "HFlexLayout", components: [{
				kind: "ToolButton", icon: "images/icon-current.png", style: "margin: -15px -8px -12px -8px;"
	//					kind: "Button", content: "Back"
			}, {
				flex: 1,
			}, {
				style: "text-transform: capitalize;", content: "Current Status"
			}, {
				flex: 1,
			}, {
				kind: "Button", caption: "Refresh", style: "margin: -15px 0px -13px 0px;", onclick: "updateCurrent"
			}]
		}, {
			name: "currentScroller", kind: "Scroller", height: "632px", components: [{
				layoutKind: "HFlexLayout", align: "center", style: "width: 100%; padding: 15px 0px 0px 0px;", components: [{
					style: "font-size: 16px; text-align: justify; padding: 5px 15px 15px 15px;", content: "Mode Switcher is activated and mode switching triggered by situation events is allowed. Currently there are 3 active mode(s), 2 profile(s) in use and 1 valid situation(s).", flex: 1
				}]
			}, {
				layoutKind: "VFlexLayout", flex: 1, components: [{
					kind: "Divider", caption: "Current Profile"
				}, {
					layoutKind: "VFlexLayout", align: "left", components: [{
						layoutKind: "HFlexLayout", align: "center", style: "width: 100%; padding: 1px 10px 5px 10px;", components: [{
							name: "currentProfile", kind: "RowGroup", flex: 1, components: []
						}]
					}, {
						style: "font-size: 16px; opacity: 0.6; padding: 0px 15px 15px 15px;", content: "List of system settings currently effected by Mode Switcher and their value."
					}]
				}, {
					kind: "Divider", caption: "Current Situation"
				}, {
					layoutKind: "VFlexLayout", flex: 1, align: "left", components: [{
						layoutKind: "HFlexLayout", align: "center", style: "width: 100%; padding: 1px 10px 5px 10px;", components: [{
							name: "currentSituation", kind: "RowGroup", flex: 1, components: []
						}]
					}, {
						style: "font-size: 16px; opacity: 0.6; padding: 0px 15px 0px 15px;", content: "List of triggers currently monitored by Mode Switcher and their state."
					}]	
				}]
			}]
		}]
	}, {
		name: "viewHistory", flex: 1, components: [{
			kind: "PageHeader", layoutKind: "HFlexLayout", components: [{
				kind: "ToolButton", icon: "images/icon-history.png", style: "margin: -15px -8px -12px -8px;"
	//					kind: "Button", content: "Back"
			}, {
				flex: 1,
			}, {
				style: "text-transform: capitalize;", content: "Event History"
			}, {
				flex: 1,
			}, {
				kind: "Button", caption: "Refresh", style: "margin: -15px 0px -13px 0px;", onclick: "updateHistory"
			}]
		}, {
			name: "historyScroller", kind: "Scroller", height: "632px", components: [{
				kind: "RowGroup", flex: 1, style: "margin: 15px 13px 15px 13px;", components: [{
					layoutKind: "HFlexLayout", align: "center", flex: 1, components: [{
						content: "Filter Events", flex: 1, className: "enyo-label"
					}, {				
						name: "eventsFilter", kind: "ListSelector", value: 0, onChange: "updateHistory", items: [
							{caption: "Show All Events", value: 0},
							{caption: "Show Mode Changes", value: 1},
							{caption: "Show Trigger Events", value: 2}				
						]
					}]
				}]
			}, {		
				layoutKind: "VFlexLayout", flex: 1, components: [{
					kind: "Divider", caption: "Events List"
				}]
			}, {
				kind: "RowGroup", flex: 1, style: "margin: 15px 13px 15px 13px;", components: [{
					name: "listEvents", kind: "VirtualRepeater", onSetupRow: "getEventItem", style: "margin: -10px;", components: [{
						name: "eventItem", kind: "Item", layoutKind: "HFlexLayout", align: "center", flex: 1, components: [{
							layoutKind: "VFlexLayout", flex: 1, components: [{
								name: "eventLabel", content: "" 
							}, {
								name: "eventDetails", content: "", style: "opacity: 0.6;", className: "enyo-item-secondary"
							}]
						}, {
							layoutKind: "VFlexLayout", components: [{				
								name: "eventDate", content: "", className: "enyo-label", style: "padding-right: 0px;font-weight: normal;"
							}, {
								name: "eventTime", content: "", className: "enyo-label", style: "padding-right: 0px;font-weight: normal;"
							}]
						}]
					}]
				}]
			}, {
				style: "font-size: 16px; opacity: 0.6; padding: 0px 15px 0px 15px;", content: "List of events that have caused Mode Switcher to be waken up and take action."
			}]
		}]
	}, {
		kind: "Toolbar", className: "enyo-toolbar-light", components: [{
			style: "width: 60px;"
		}, {
			kind: "Spacer", flex: 1
		}, {
			kind: "Button", caption: "Help", toggling: true, slidingHandler: true, style: "margin-right: 8px;"
		}]
	}],
	
	rendered: function() {
		this.inherited(arguments);
		
		this.$.viewHistory.hide();
		
		this.adjustScroller();
		
		this.updateCurrent();
	},

	resizeHandler: function() {
		this.adjustScroller();
	},
	
	adjustScroller: function() {
		var s = enyo.fetchControlSize(this);

		this.$.currentScroller.applyStyle("height", (s.h - 88) + "px");
		this.$.historyScroller.applyStyle("height", (s.h - 88) + "px");
	},
	
	showCurrent: function() {
		this.$.viewHistory.hide();
		this.$.viewCurrent.show();
	},

	showHistory: function() {
		this.$.viewCurrent.hide();
		this.$.viewHistory.show();
	},

	updateCurrent: function() {
		this.updateProfile();
		this.updateSituation();
	},

	updateHistory: function() {
		this.$.listEvents.render();
	},
		
	updateProfile: function() {
		for(var i = 0; i < this._profile.length; i++) {
			var settings = [];
			
			if(this.$["setting" + i]) {
				this.$["setting" + i].parent.destroy();
				this.$["setting" + i].destroy();
			}
			
			for(var j = 0; j < this._profile[i].settings.length; j++) {	
				settings.push({
					kind: "Item", layoutKind: "HFlexLayout", pack: "center", flex: 1, style: "width: 100%;background:#BBBBBB;", 
						tapHighlight: true, components: [{
							content: this._profile[i].settings[j].label, style: "margin-top:-3px;margin-bottom:-3px;font-weight: normal;", flex: 1
						}, {
							content: this._profile[i].settings[j].value, className: "enyo-label", style: "padding-right: 0px;font-weight: normal;"
						}]
				});
			}

			this.$.currentProfile.createComponent({
				name: "setting" + i, kind: "Drawer", caption: this._profile[i].group, style: "background: url(images/drawer-closed.png) top right no-repeat;", 
					flex: 1, open: false, onOpenChanged: "handleDrawerToggle", components: settings}, {owner: this});
		}

		this.$.currentProfile.render();
	},

	updateSituation: function() {
		for(var i = 0; i < this._situation.length; i++) {
			if(this.$["trigger" + i])
				this.$["trigger" + i].destroy();

			this.$.currentSituation.createComponent({
				name: "trigger" + i, layoutKind: "HFlexLayout", align: "center", flex: 1, components: [{
					flex: 1, style: "text-transform: capitalize; margin-top: -1px;", content: this._situation[i].label
				}, {
					className: "enyo-label", style: "padding-right: 0px;font-weight: normal;", content: this._situation[i].value
				}]}, {owner: this});
		}

		this.$.currentSituation.render();		
	},
	
	handleDrawerToggle: function(inSender) {
		if(!this.$[inSender.name].getOpen()) {
			this.$[inSender.name].applyStyle("font-weight", "normal");
			this.$[inSender.name].applyStyle("background", "url(images/drawer-closed.png) top right no-repeat");
		}
		else {
	/*		for(var i = 0; i < this._profile.length; i++) {
				if((this.$["setting" + i]) && ("drawer" + i != inSender.name)) {
					this.$["setting" + i].close();
				}
			}
	*/
			this.$[inSender.name].applyStyle("font-weight", "bold");		
			this.$[inSender.name].applyStyle("background", "url(images/drawer-opened.png) top right no-repeat");
		}
	},

	getEventItem: function(inSender, inIndex) {	
		var list = [];

		for(var i = 0; i < this._events.length; i++) {
			if((this.$.eventsFilter.getValue() == 0) ||
				((this.$.eventsFilter.getValue() == 1) && (this._events[i].type == "modeChange")) ||
				((this.$.eventsFilter.getValue() == 2) && (this._events[i].type == "triggerEvent")))
			{
				list.push(this._events[i]);
			}
		}
		
		if((inIndex >= 0) && (inIndex < list.length)) {
			if(inIndex == 0)
				this.$.eventItem.applyStyle("border-top", "0px");
			if(inIndex == this._events.length - 1)
				this.$.eventItem.applyStyle("border-bottom", "0px");
					
			this.$.eventLabel.setContent(list[inIndex].label);
			this.$.eventDetails.setContent(list[inIndex].details);
			this.$.eventDate.setContent(list[inIndex].date);
			this.$.eventTime.setContent(list[inIndex].time);
												
			return true;
		}
	}
});
