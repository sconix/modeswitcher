enyo.kind({
	name: "Main",
	kind: enyo.VFlexBox,

	_modes: [{
		name: "Airplane Mode",
		icon: "mode-icons/airplane.png",
		state: "ON"
	}, {
		name: "Music Mode",
		icon: "mode-icons/music.png",
		state: "OFF"
	}, {
		name: "Outside Mode",
		icon: "mode-icons/outside.png",
		state: "OFF"
	}, {
		name: "Silent Mode",
		icon: "mode-icons/silent.png",
		state: "OFF"
	}, {
		name: "Work Mode",
		icon: "mode-icons/work.png",
		state: "OFF"
	}],

	_profiles: [{
		name: "Airplane Profile",
		icon: "icon-profile.png",
		state: "ON"
	}, {
		name: "Music Profile",
		icon: "icon-profile.png",
		state: "OFF"
	}, {
		name: "Silent Profile",
		icon: "icon-profile.png",
		state: "OFF"
	}, {
		name: "Outside Profile",
		icon: "icon-profile.png",
		state: "OFF"
	}],

	_situations: [{
		name: "Home (Daytime)",
		icon: "icon-situation.png",
		state: "OFF"
	}, {
		name: "Home (Night Time)",
		icon: "icon-situation.png",
		state: "OFF"
	}, {
		name: "Work (Weekdays)",
		icon: "icon-situation.png",
		state: "OFF"
	}],

	components: [{
		kind: "SlidingPane", flex: 1, style: "background: #666666;", components: [{
			name: "left", width: "320px", components: [{
				kind: "CustomPageHeader", taglines: [{weight: 100, text: "Take Full Control Of Your Device!"}]
			}, {
				layoutKind: "VFlexLayout", flex: 1, components: [{
					kind: "Item", layoutKind: "HFlexLayout", pack: "left", style: "width: 100%;", tapHighlight: false, 
						onclick: "handleCategory", style: "background: #888888; color: #EAEAEA;", components: 
					[{
						kind: "Image", src: "images/icon-separator.png", style: "opacity: 0.8; margin: 1px 18px -8px 5px;"
					}, {
						content: "Status Information", style: "padding-top: 4px; padding-bottom: 6px;"
					}]
				}, {
					kind: "Item", layoutKind: "HFlexLayout", align: "center", style: "width: 100%;", tapHighlight: true, 
						onclick: "handleCurrentStatus", components: 
					[{
						kind: "Image", src: "images/icon-current.png", style: "margin: -10px 18px -8px 5px;"
					}, {
						flex: 1, style: "text-transform: capitalize; margin-top: -1px;", content: "View Current Status"
					}]
				}, {
					kind: "Item", layoutKind: "HFlexLayout", align: "center", style: "width: 100%;", tapHighlight: true, 
						onclick: "handleEventHistory", components: 
					[{
						kind: "Image", src: "images/icon-history.png", style: "margin: -10px 18px -8px 5px;"
					}, {
						flex: 1, style: "text-transform: capitalize; margin-top: -1px;", content: "View Event History"
					}]
				}, {
					kind: "Item", layoutKind: "HFlexLayout", pack: "left", style: "width: 100%;", tapHighlight: false, 
						 style: "background: #888888; color: #EAEAEA;", components: 
					[{
						kind: "Image", src: "images/icon-separator.png", style: "opacity: 0.8; margin: 1px 18px -8px 5px;"
					}, {
						name: "configSelect", kind: "ListSelector", flex: 1, value: 0, onChange: "handleConfigList", items: [
							{caption: "Configured Modes", value: 0},
							{caption: "Configured Profiles", value: 1},
							{caption: "Configured Situations", value: 2}
						]
					}]
				}, {
					name: "listConfig", kind: "VirtualRepeater", onSetupRow: "getModeItem", components: [{
						kind: "Item", layoutKind: "HFlexLayout", align: "center", style: "width: 100%;", tapHighlight: true, 
							onclick: "handleListSelect", components: 
						[{
							name: "itemIcon", kind: "Image", src: "images/icon-default.png", style: "margin: -10px 18px -8px 5px;"
						}, {
							name: "itemName", flex: 1, style: "text-transform: capitalize; margin-top: -1px;", content: "Airplane Mode"
						}, {
							name: "itemState", className: "enyo-label", style: "padding-right: 20px;", content: "off"
						}]
     				}]
				}, {
					kind: "Item", layoutKind: "HFlexLayout", align: "center", style: "width: 100%;", tapHighlight: true, 
						onclick: "handleCategory", components: 
					[{
						kind: "Image", src: "images/icon-plus.png", style: "opacity: 0.9; margin: -10px 18px -8px 5px;"
					}, {
						name: "addItem", flex: 1, style: "opacity: 0.6; text-transform: capitalize; margin-top: -1px;", content: "Create / Import Mode"
					}]
				}]
			}, {
				kind: "Toolbar", pack: "left", className: "enyo-toolbar-light", components: [{
					kind: "Image", src: "images/icon-on.png", style: "margin: -3px 25px -8px 10px;"
				}, {
					flex: 1,
				}, {
					kind: "Button", caption: "Reload Configuration", style: "margin-left: -15px;"
				}, {
					flex: 1,
				}, {
					kind: "ToolButton", icon: "images/icon-unlocked.png"
				}]
			}]
		}, {
			name: "middle", fixedWidth: true, peekWidth: 64, dragAnywhere: false, width: "704px", style: "z-index: 10;", components: [{
				name: "tag", kind: "CustomSlidingTag"
			}, {
				name: "pane", kind: "Pane", flex: 1, components: [{
					kind: "Info"
				}, {
					kind: "Mode"
				}, {
					kind: "Profile"
				}, {
					kind: "Situation"
/*				}, {
					kind: "Sharing"*/
				}]
			}]
		}, {
			name: "right", fixedWidth: true, peekWidth: 768, dragAnywhere: false, width: "256px", style: "z-index: 10;", components: [{
				kind: "PageHeader", layoutKind: "VFlexLayout", components: [{
					name: "rightTitle", style: "text-transform: capitalize;", content: "Help"
				}]
			}, {
				name: "help", kind: "Help", className: "enyo-bg"
			}]
		}]		
	}],

	rendered: function() {
		this.inherited(arguments);

		this.adjustSliding();

		this.$.help.update("current");
		
		this.$.listConfig.render();
	},

	resizeHandler: function() {
		this.adjustSliding();
	},
	
	adjustSliding: function() {
		var s = enyo.fetchControlSize(this);

		this.$.middle.applyStyle("width", (s.w - 320) + "px");
		
		this.$.right.setPeekWidth(s.w - 320 + 64);
	},
	
	handleConfigList: function(inSender, inValue) {
		this.$.listConfig.render();

		if(inValue == 0) {
			if(this.$.pane.getViewIndex() !=  0)
				this.$.pane.selectViewByIndex(1);		

			this.$.addItem.setContent("Create / Import Mode");
		}
		else if(inValue == 1) {
			if(this.$.pane.getViewIndex() !=  0)
				this.$.pane.selectViewByIndex(2);

			this.$.addItem.setContent("Create / Import Profile");
		}
		else if(inValue == 2) {
			if(this.$.pane.getViewIndex() !=  0)
				this.$.pane.selectViewByIndex(3);

			this.$.addItem.setContent("Create / Import Situation");
		}
	},
	
	getModeItem: function(inSender, inIndex) {
		if(this.$.configSelect.getValue() == 0)
			var list = this._modes;
		else if(this.$.configSelect.getValue() == 1)							
			var list = this._profiles;
		else if(this.$.configSelect.getValue() == 2)
			var list = this._situations;
		else
			return false;

		if((inIndex >= 0) && (inIndex < list.length)) {
			this.$.itemName.setContent(list[inIndex].name);
			
			if(list[inIndex].icon != undefined)
				this.$.itemIcon.setSrc("images/" + list[inIndex].icon);
				
			this.$.itemState.setContent(list[inIndex].state);

			return true;
		}

		return false;
	},
	
	handleCurrentStatus: function() {
		this.$.pane.selectViewByIndex(0);

		this.$.tag.$.TagMarker.applyStyle("top", "130px");
		
		this.$.info.showCurrent();
		
		this.$.help.update("current");
	},
	
	handleEventHistory: function() {
		this.$.pane.selectViewByIndex(0);

		this.$.tag.$.TagMarker.applyStyle("top", "175px");
		
		this.$.info.showHistory();

		this.$.help.update("history");
	},
	
	handleListSelect: function() {
		if(this.$.configSelect.getValue() == 0) {
			this.$.pane.selectViewByIndex(1);
		}
		else if(this.$.configSelect.getValue() == 1) {
			this.$.pane.selectViewByIndex(2);
		}
		else if(this.$.configSelect.getValue() == 2) {
			this.$.pane.selectViewByIndex(3);
		}

		this.$.tag.$.TagMarker.applyStyle("top", "275px");
	}	
});

