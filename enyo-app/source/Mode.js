enyo.kind({
	name: "Mode",
	kind: enyo.VFlexBox,
	
	_selected: {
		profiles: [],
		situations: [],
		actions: {
			start: [],
			close: []
		}
	},

	_configured: {
		profiles: [{
			name: "Music Profile"
		}, {
			name: "Outside Profile"
		}, {
			name: "Silent Profile"
		}],
		situations: [{
			name: "At Home (Daytime)"
		}, {
			name: "At Home (Night Time)"
		}, {
			name: "At Work (Weekdays)"
		}],
		actions: [{
			name: "Execute Application Launch"
		}, {
			name: "Ask To Launch An Application"
/*		}, {
			name: "Execute Govnah Profile Change"*/
		}]
	},

	components: [{
		kind: "PageHeader", layoutKind: "HFlexLayout", components: [{
//					kind: "Button", content: "Back"
			kind: "ToolButton", icon: "images/mode-icons/airplane.png", style: "margin: -15px -8px -12px -8px;"
		}, {
			flex: 1,
		}, {
			name: "middleTitle", style: "text-transform: capitalize;", content: "Airplane Mode"
		}, {
			flex: 1,
		}, {
			kind: "ToggleButton", onLabel: "On", offLabel: "Off", state: false, style: "margin: -17px 0 -10px 0;", onChange: "buttonToggle"				
		}]
	}, {
		name: "actionPopup", kind: "Popup", components: [{
			name: "availableActions", kind: "VirtualRepeater", onSetupRow: "getAvailableAction", style: "margin: -10px;", components: [{						
				name: "availableActionItem", kind: "Item", components: [{
					name: "availableActionName", content: ""
				}]
			}]
		}]	
	}, {
		name: "pageScroller", kind: "Scroller", height: "612px", components: [{
			name: "viewProfiles", layoutKind: "VFlexLayout", flex: 1, components: [{
				layoutKind: "HFlexLayout", align: "center", style: "width: 100%;", components: [{
					kind: "RowGroup", flex: 1, style: "margin: 15px 13px 15px 13px;", components: [{
						layoutKind: "HFlexLayout", align: "center", flex: 1, components: [{
							content: "Change Notification", flex: 1, className: "enyo-label"
						}, {				
							kind: "ListSelector", value: 1, onChange: "itemChanged", items: [
								{caption: "Disabled", value: 0},
								{caption: "Only Banner", value: 1},
								{caption: "Only Sound", value: 2},
								{caption: "Only Vibrate", value: 3},
								{caption: "Banner + Sound", value: 4},
								{caption: "Banner + Vibrate", value: 5}
							]
						}]
					}]
				}]
			}, {
				kind: "Divider", caption: "Selected Profiles"
			}, {
				layoutKind: "VFlexLayout", align: "center", components: [{
					layoutKind: "HFlexLayout", align: "center", style: "width: 100%; padding: 1px 10px 5px 10px;", components: [{
						kind: "RowGroup", flex: 1, components: [{	
							name: "selectedProfiles", kind: "VirtualRepeater", onSetupRow: "getSelectedProfile", style: "margin: -10px;", components: [{						
								name: "selectedProfileItem", kind: "Item", layoutKind: "HFlexLayout", align: "center", flex: 1, tapHighlight: true, onclick: "unselectProfile", components: [{
									name: "selectedProfileName", content: "", flex: 1, style: "text-transform: capitalize; margin-top: -1px;"
								}, {
									kind: "Button", caption: "Edit", style: "margin: -5px 0px -5px 0px;"
								}]
							}]
						}]
					}]
				}, {
					style: "font-size: 16px; opacity: 0.6; padding: 5px 15px 15px 15px;", content: "Profiles will be applied in the order they are in the list when mode gets activated. This means that the lowest profile in the list will override settings in profiles that are earlier in the list."
				}]
			}, {
				kind: "Divider", caption: "Configured Profiles"
			}, {
				layoutKind: "VFlexLayout", flex: 1, align: "left", components: [{
					layoutKind: "HFlexLayout", align: "center", style: "width: 100%; padding: 5px 10px 0px 10px;", components: [{
						kind: "RowGroup", flex: 1, components: [{
							name: "configuredProfiles", kind: "VirtualRepeater", onSetupRow: "getConfiguredProfile", style: "margin: -10px;", components: [{						
								name: "configuredProfileItem", kind: "Item", layoutKind: "HFlexLayout", align: "center", flex: 1, tapHighlight: true, onclick: "selectProfile", components: [{
									name: "configuredProfileName", content: "", flex: 1, style: "text-transform: capitalize; margin-top: -1px;"
								}, {
									kind: "Button", caption: "Edit", style: "margin: -5px 0px -5px 0px;"
								}]
							}]
						}, {
							layoutKind: "HFlexLayout", flex: 1, tapHighlight: true, components: [{
								kind: "Image", src: "images/icon-plus.png", style: "opacity: 0.9; margin: -20px -8px -8px -5px;"
							}, {
								flex: 1, style: "opacity: 0.6; padding-left: 10px; text-transform: capitalize; margin-top: -1px;", content: "Create / Import Profile", onclick: "createImportProfile"
							}]
						}]
					}]
				}, {
					style: "font-size: 16px; opacity: 0.6; padding: 5px 15px 0px 15px;", content: "Tap profile to select/unselect (move it into selected profiles / remove it from selected profiles)."
				}]	
			}]
		}, {
			name: "viewSituations", layoutKind: "VFlexLayout", flex: 1, components: [{
				layoutKind: "HFlexLayout", align: "center", style: "width: 100%;", components: [{
					kind: "RowGroup", flex: 1, style: "margin: 15px 3px 15px 13px;", components: [{
						layoutKind: "HFlexLayout", align: "center", flex: 1, components: [{
							content: "Start Mode", flex: 1, className: "enyo-label"
						}, {				
							kind: "ListSelector", value: 0, onChange: "itemChanged", items: [
								{caption: "Only Manually", value: 0},
								{caption: "Immeadiately", value: 1},
								{caption: "After Timeout", value: 2},
								{caption: "By Selecting", value: 3}						
							]
						}]
					}]
				}, {
					kind: "RowGroup", flex: 1, style: "margin: 15px 13px 15px 3px;", components: [{
						layoutKind: "HFlexLayout", align: "center", flex: 1, components: [{
							content: "Close Mode", flex: 1, className: "enyo-label"
						}, {				
							kind: "ListSelector", value: 0, onChange: "itemChanged", items: [
								{caption: "Only Manually", value: 0},
								{caption: "Immeadiately", value: 1},
								{caption: "After Timeout", value: 2},
								{caption: "By Selecting", value: 3}						
							]
						}]
					}]
				}]
			}, {
				kind: "Divider", caption: "Selected Situations"
			}, {
				layoutKind: "VFlexLayout", align: "center", components: [{
					layoutKind: "HFlexLayout", align: "center", style: "width: 100%; padding: 1px 10px 5px 10px;", components: [{
						kind: "RowGroup", flex: 1, components: [{	
							name: "selectedSituations", kind: "VirtualRepeater", onSetupRow: "getSelectedSituation", style: "margin: -10px;", components: [{						
								name: "selectedSituationItem", kind: "Item", layoutKind: "HFlexLayout", align: "center", flex: 1, tapHighlight: true, onclick: "unselectSituation", components: [{
									name: "selectedSituationName", content: "", flex: 1, style: "text-transform: capitalize; margin-top: -1px;"
								}, {
									kind: "Button", caption: "Edit", style: "margin: -5px 0px -5px 0px;"
								}]
							}]
						}]
					}]
				}, {
					style: "font-size: 16px; opacity: 0.6; padding: 5px 15px 15px 15px;", content: "When ever any of the situations on the list will become valid the mode activates, when none is valid the mode is closed."
				}]
			}, {
				kind: "Divider", caption: "Configured Situations"
			}, {
				layoutKind: "VFlexLayout", flex: 1, align: "left", components: [{
					layoutKind: "HFlexLayout", align: "center", style: "width: 100%; padding: 5px 10px 0px 10px;", components: [{
						kind: "RowGroup", flex: 1, components: [{
							name: "configuredSituations", kind: "VirtualRepeater", onSetupRow: "getConfiguredSituation", style: "margin: -10px;", components: [{						
								name: "configuredSituationItem", kind: "Item", layoutKind: "HFlexLayout", align: "center", flex: 1, tapHighlight: true, onclick: "selectSituation", components: [{
									name: "configuredSituationName", content: "", flex: 1, style: "text-transform: capitalize; margin-top: -1px;"
								}, {
									kind: "Button", caption: "Edit", style: "margin: -5px 0px -5px 0px;"
								}]
							}]
						}, {
							layoutKind: "HFlexLayout", flex: 1, components: [{
								kind: "Image", src: "images/icon-plus.png", style: "opacity: 0.9; margin: -20px -8px -8px -5px;"
							}, {
								flex: 1, style: "opacity: 0.6; padding-left: 10px; text-transform: capitalize; margin-top: -1px;", content: "Create / Import Situation"
							}]
						}]
					}]
				}, {
					style: "font-size: 16px; opacity: 0.6; padding: 5px 15px 0px 15px;", content: "Tap situation to select/unselect (move it into selected situations / remove it from selected situations)."
				}]	
			}]
		}, {
			name: "viewActions", layoutKind: "VFlexLayout", flex: 1, components: [{
				layoutKind: "HFlexLayout", align: "center", style: "width: 100%;", components: [{
					kind: "RowGroup", flex: 1, style: "margin: 15px 3px 15px 13px;", components: [{
						layoutKind: "HFlexLayout", align: "center", flex: 1, components: [{
							content: "On Start", flex: 1, className: "enyo-label"
						}, {				
							kind: "ListSelector", value: 0, onChange: "itemChanged", items: [
								{caption: "Do Nothing", value: 0},
								{caption: "Close All Apps", value: 1}					
							]
						}]
					}]
				}, {
					kind: "RowGroup", flex: 1, style: "margin: 15px 13px 15px 3px;", components: [{
						layoutKind: "HFlexLayout", align: "center", flex: 1, components: [{
							content: "On Close", flex: 1, className: "enyo-label"
						}, {				
							kind: "ListSelector", value: 2, onChange: "itemChanged", items: [
								{caption: "Do Nothing", value: 0},
								{caption: "Close All Apps", value: 1},
								{caption: "Close Launched", value: 2}					
							]
						}]
					}]
				}]
			}, {
				kind: "Divider", caption: "On Start Actions"
			}, {
				layoutKind: "VFlexLayout", align: "center", components: [{
					layoutKind: "HFlexLayout", align: "center", style: "width: 100%; padding: 1px 10px 5px 10px;", components: [{
						kind: "RowGroup", flex: 1, components: [{	
							layoutKind: "HFlexLayout", align: "center", flex: 1, components: [{
								flex: 1, style: "text-transform: capitalize; margin-top: -1px;", content: "Perform Application Launch"
							}, {
								className: "enyo-label", content: "Browser"
							}]
						}, {
							layoutKind: "HFlexLayout", align: "center", flex: 1, components: [{
								flex: 1, style: "text-transform: capitalize; margin-top: -1px;", content: "Ask To Launch Application"
							}, {
								className: "enyo-label", content: "Music Player"
							}]
						}, {
							layoutKind: "HFlexLayout", align: "center", flex: 1, components: [{
								flex: 1, style: "text-transform: capitalize; margin-top: -1px;", content: "Perform Govnah Profile Change"
							}, {
								className: "enyo-label", content: "PowerSave"
							}]
						}, {
							layoutKind: "HFlexLayout", align: "center", flex: 1, components: [{
								kind: "Image", src: "images/icon-plus.png", style: "opacity: 0.9; margin: -20px -8px -8px -5px;"
							}, {
								flex: 1, style: "opacity: 0.6; padding-left: 10px; text-transform: capitalize; margin-top: -1px;", content: "Add New Action", onclick: "selectStartAction"
							}]
						}]
					}]
				}, {
					style: "font-size: 16px; opacity: 0.6; padding: 5px 15px 15px 15px;", content: "Actions are carried out on the order they are on the list when the mode is started. Meaning that action that is last on the list is carried out last."
				}]
			}, {
				kind: "Divider", caption: "On Close Actions"
			}, {
				layoutKind: "VFlexLayout", flex: 1, align: "left", components: [{
					layoutKind: "HFlexLayout", align: "center", style: "width: 100%; padding: 5px 10px 0px 10px;", components: [{
						kind: "RowGroup", flex: 1, components: [{	
							layoutKind: "HFlexLayout", align: "center", flex: 1, components: [{
								flex: 1, style: "text-transform: capitalize; margin-top: -1px;", content: "Perform Govnah Profile Change"
							}, {
								className: "enyo-label", content: "Default"
							}]
						}, {
							layoutKind: "HFlexLayout", align: "center", flex: 1, components: [{
								flex: 1, style: "text-transform: capitalize; margin-top: -1px;", content: "Perform Triggering Of Mode"
							}, {
								className: "enyo-label", content: "Outside Mode"
							}]
						}, {
							layoutKind: "HFlexLayout", align: "center", flex: 1, components: [{
								kind: "Image", src: "images/icon-plus.png", style: "opacity: 0.9; margin: -20px -8px -8px -5px;"
							}, {
								flex: 1, style: "opacity: 0.6; padding-left: 10px; text-transform: capitalize; margin-top: -1px;", content: "Add New Action"
							}]
						}]
					}]
				}, {
					style: "font-size: 16px; opacity: 0.6; padding: 5px 15px 15px 15px;", content: "Actions are carried out on the order they are on the list when mode is closed. Meaning that action that is last on the list is carried out last."
				}]	
			}]
		}]
	}, {
		kind: "Toolbar", pack: "center", className: "enyo-toolbar-light", components: [{
			style: "width: 60px;"
		}, {
			kind: "Spacer", flex: 1
		}, {
			kind: "RadioToolButtonGroup", style: "margin: -8px -10px -13px 0px;", components: [{
				label: "Profiles", onclick: "handleProfiles" 
			}, {
				label: "Situations", onclick: "handleSituations"
			}, {
				label: "Actions", onclick: "handleActions"
			}]
		}, {
			kind: "Spacer", flex: 1
		}, {
			kind: "Button", caption: "Help", toggling: true, slidingHandler: true, style: "margin-right: 8px;"
		}]
	}],

	rendered: function() {
		this.inherited(arguments);
		
		this.$.viewSituations.hide();
		this.$.viewActions.hide();
	},

	resizeHandler: function() {
		this.adjustScroller();
	},
	
	adjustScroller: function() {
		var s = enyo.fetchControlSize(this);

		this.$.pageScroller.applyStyle("height", (s.h - 108) + "px");
	},
		
	handleProfiles: function() {
		this.$.viewSituations.hide();
		this.$.viewActions.hide();
		this.$.viewProfiles.show();
	},
	
	handleSituations: function() {
		this.$.viewProfiles.hide();
		this.$.viewActions.hide();
		this.$.viewSituations.show();
	},
	
	handleActions: function() {
		this.$.viewProfiles.hide();
		this.$.viewSituations.hide();
		this.$.viewActions.show();
	},
	
	selectProfile: function(inSender, inEvent) {
		this._selected.profiles.push(this._configured.profiles[inEvent.rowIndex]);
		
		this._configured.profiles.splice(inEvent.rowIndex, 1);
		
		this.$.selectedProfiles.render();
		this.$.configuredProfiles.render();
	},

	unselectProfile: function(inSender, inEvent) {
		this._configured.profiles.push(this._selected.profiles[inEvent.rowIndex]);
		
		this._configured.profiles.sort(this.sortAlphabeticallyFunction);
		
		this._selected.profiles.splice(inEvent.rowIndex, 1);
		
		this.$.selectedProfiles.render();
		this.$.configuredProfiles.render();
	},

	createImportProfile: function() {
	},

	getSelectedProfile: function(inSender, inIndex) {
		if((inIndex >= 0) && (inIndex < this._selected.profiles.length)) {
			if(inIndex == 0)
				this.$.selectedProfileItem.applyStyle("border-top", "0px");
			if(inIndex == this._selected.profiles.length - 1)
				this.$.selectedProfileItem.applyStyle("border-bottom", "0px");

			this.$.selectedProfileName.setContent(this._selected.profiles[inIndex].name);
			
			return true;
		}		
	},

	getConfiguredProfile: function(inSender, inIndex) {
		if((inIndex >= 0) && (inIndex < this._configured.profiles.length)) {
			if(inIndex == 0)
				this.$.configuredProfileItem.applyStyle("border-top", "0px");
			if(inIndex == this._configured.profiles.length - 1)
				this.$.configuredProfileItem.applyStyle("border-bottom", "0px");

			this.$.configuredProfileName.setContent(this._configured.profiles[inIndex].name);
			
			return true;
		}		
	},

	selectSituation: function(inSender, inEvent) {
		this._selected.situations.push(this._configured.situations[inEvent.rowIndex]);
		
		this._configured.situations.splice(inEvent.rowIndex, 1);
		
		this.$.selectedSituations.render();
		this.$.configuredSituations.render();
	},

	unselectSituation: function(inSender, inEvent) {
		this._configured.situations.push(this._selected.situations[inEvent.rowIndex]);
		
		this._configured.situations.sort(this.sortAlphabeticallyFunction);
		
		this._selected.situations.splice(inEvent.rowIndex, 1);
		
		this.$.selectedSituations.render();
		this.$.configuredSituations.render();
	},

	getSelectedSituation: function(inSender, inIndex) {
		if((inIndex >= 0) && (inIndex < this._selected.situations.length)) {
			if(inIndex == 0)
				this.$.configuredSituationItem.applyStyle("border-top", "0px");
			if(inIndex == this._selected.situations.length - 1)
				this.$.configuredSituationItem.applyStyle("border-bottom", "0px");

			this.$.selectedSituationName.setContent(this._selected.situations[inIndex].name);
			
			return true;
		}		
	},

	getConfiguredSituation: function(inSender, inIndex) {
		if((inIndex >= 0) && (inIndex < this._configured.situations.length)) {
			if(inIndex == 0)
				this.$.configuredSituationItem.applyStyle("border-top", "0px");
			if(inIndex == this._configured.situations.length - 1)
				this.$.configuredSituationItem.applyStyle("border-bottom", "0px");

			this.$.configuredSituationName.setContent(this._configured.situations[inIndex].name);
			
			return true;
		}		
	},
	
	selectStartAction: function() {
		this.$.actionPopup.openAtCenter();
	},
	
	getAvailableAction: function(inSender, inIndex) {
		if((inIndex >= 0) && (inIndex < this._configured.actions.length)) {
			if(inIndex == 0)
				this.$.availableActionItem.applyStyle("border-top", "0px");
			if(inIndex == this._configured.actions.length - 1)
				this.$.availableActionItem.applyStyle("border-bottom", "0px");

			this.$.availableActionName.setContent(this._configured.actions[inIndex].name);
			
			return true;
		}		
	},
	
	sortAlphabeticallyFunction: function(a, b) {
		var c = a.name.toLowerCase();
		var d = b.name.toLowerCase();

		return ((c < d) ? -1 : ((c > d) ? 1 : 0));
	}
});
