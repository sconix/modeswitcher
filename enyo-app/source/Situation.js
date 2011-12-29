enyo.kind({
	name: "Situation",
	kind: enyo.VFlexBox,
	
	components: [{
		kind: "PageHeader", layoutKind: "HFlexLayout", components: [{
//					kind: "Button", content: "Back"
			kind: "ToolButton", icon: "images/icon-situation.png", style: "margin: -15px -8px -12px -8px;"
		}, {
			flex: 1,
		}, {
			name: "middleTitle", style: "text-transform: capitalize;", content: "Home (Daytime)"
		}, {
			flex: 1,
		}, {
			kind: "Button", caption: "Fetch", style: "margin: -15px 0px -13px 0px;"
		}]
	}, {
		layoutKind: "HFlexLayout", align: "center", style: "width: 100%;", components: [{
			kind: "RowGroup", flex: 1, style: "margin: 15px 13px 15px 13px;", components: [{
				layoutKind: "HFlexLayout", align: "center", flex: 1, components: [{
					content: "Required Triggers", flex: 1, className: "enyo-label"
				}, {				
					kind: "ListSelector", value: 0, onChange: "itemChanged", items: [
						{caption: "Any Trigger", value: 0},
						{caption: "All Unique", value: 1},
						{caption: "All Triggers", value: 2}
					]
				}]
			}]
		}]
	}, {
		layoutKind: "VFlexLayout", flex: 1, components: [{
			kind: "Divider", caption: "Triggers"	
		}, {
			layoutKind: "VFlexLayout", align: "left", components: [{
				layoutKind: "HFlexLayout", align: "center", style: "width: 100%; padding: 1px 10px 5px 10px;", components: [{
					kind: "RowGroup", flex: 1, components: [{
						kind: "Drawer", caption: "Wi-Fi Connection", style: "font-weight: bold;background: url(images/drawer-opened.png) top right no-repeat;", flex: 1, open: true, components: [{
							kind: "Item", layoutKind: "HFlexLayout", pack: "center", flex: 1, style: "width: 100%;background:#BBBBBB;", tapHighlight: true, 
								onclick: "handleCategory", components:
							[{
								content: "Active When", style: "margin-top:-3px;margin-bottom:-3px;font-weight: normal;", flex: 1
							}, {
								className: "enyo-label", style: "padding-right: 0px;font-weight: normal;", content: "Connected To"
							}]
						}, {
							kind: "Item", className: "enyo-last", layoutKind: "HFlexLayout", align: "center", flex: 1, style: "width: 100%;background:#BBBBBB;", tapHighlight: true, 
								onclick: "handleCategory", components:
							[{
								content: "Network SSID", style: "margin-top:-3px;margin-bottom:-3px;font-weight: normal;", flex: 1
							}, {
								className: "enyo-label", style: "padding-right: 0px;font-weight: normal;", content: "Home"
							}]
						}]
					}, {
						kind: "Drawer", caption: "Charging Event", style: "background: url(images/drawer-closed.png) top right no-repeat;", flex: 1, open: false, components: [{
							kind: "Item", className: "enyo-last", layoutKind: "HFlexLayout", align: "center", flex: 1, style: "width: 100%;background:#BBBBBB;", tapHighlight: true, 
								onclick: "handleCategory", components:
							[{
								content: "Connected To", style: "margin-top:-3px;margin-bottom:-3px;font-weight: normal;", flex: 1
							}, {
								className: "enyo-label", style: "padding-right: 0px;font-weight: normal;", content: "Touchstone"
							}]
						}]
					}, {
						layoutKind: "HFlexLayout", align: "center", flex: 1, components: [{
							kind: "Image", src: "images/icon-plus.png", style: "opacity: 0.9; margin: -20px -8px -8px -5px;"
						}, {
							flex: 1, style: "opacity: 0.6; padding-left: 10px; text-transform: capitalize; margin-top: -1px;", content: "Add More Triggers"
						}]
					}]
				}]
			}]
		}]
	}, {
		kind: "Toolbar", pack: "center", className: "enyo-toolbar-light", components: [{
			style: "width: 60px;"
		}, {
			kind: "Spacer", flex: 1
		}, {
			kind: "Button", layoutKind: "HFlexLayout", caption: "Import Profile", onclick: "handleImport"
		}, {
			kind: "Button", layoutKind: "HFlexLayout", caption: "Export Profile", onclick: "handleExport"
		}, {
			kind: "Spacer", flex: 1
		}, {
			kind: "Button", caption: "Help", toggling: true, slidingHandler: true, style: "margin-right: 8px;"
		}]
	}]
});
