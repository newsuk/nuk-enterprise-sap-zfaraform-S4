/*global gapi */
/*global history */
sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"news/uk/fara/util/formatter",
	"news/uk/fara/util/inputType"
], function(MessageBox, Controller, History, JSONModel, Formatter, InputType) {
	"use strict";

	return Controller.extend("news.uk.fara.controller.BaseController", {

		/**
		 * Shared app formatter
		 * @type {news.uk.fara.util.formatter}
		 */
		formatter: Formatter,
		inputType: InputType,

		/* =========================================================== */
		/* public methods					                                     */
		/* =========================================================== */

		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for navigating
		 * @param {string} sName name of the route
		 * @param {object} sName parameters of the route
		 * @param {boolean} sName defines if the hash should be replaced
		 * @public
		 */
		navTo: function(sName, oParameters, bReplace) {
			if(!oParameters){
				oParameters = {};
			}
			if(bReplace === undefined){
				//Changes the hash by default
				bReplace = false;
			}
			return this.getRouter().navTo(sName, oParameters, bReplace);
		},

		/**
		 * Convenience method for navigating back to launchpad
		 * @public
		 */
		onNavLaunchpad: function() {
			this.navTo("Launchpad");
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the component model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getCompModel: function(sName) {
			return this.getOwnerComponent().getModel(sName);
		},

		/**
		 * Convenience method for setting the component model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setCompModel: function(oModel, sName) {
			return this.getOwnerComponent().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Convenience method for getting a resource bundle text.
		 * @public
		 * @param  {string} sText Name of the resource bundle property
		 * @param {array} aTextParams Text parameters
		 * @return {string} String text corresponding to the sText property
		 */
		getResourceBundleText: function(sText, aTextParams) {
			return this.getResourceBundle().getText(sText, aTextParams);
		},

		/**
		 * Convenience method for getting a defined constant.
		 * @public
		 * @param  {string} sKey Constant key
		 * @return {string} String text corresponding to the sKey property
		 */
		getConstant: function(sKey){
			return this.getOwnerComponent().getModel("Constants").getProperty("/" + sKey);
		},

		/**
		 * Formatter instance
		 * @public
		 * @return {com.vf.instant.feedback.model.formatter} App formatter
		 */
		getFormatter: function() {
			return this.formatter;
		},

		/**
		 * Do a hardcoded navigation, no parameters needed.
		 * @public
		 * @param  {string} sRouteName Route name defined in 'manifest.json'
		 * @param  {object} oParams It depends how route is defined in 'manifest.json' file
		 */
		doNavTo: function(sRouteName, oParams) {
			if (oParams)
				this.getRouter().navTo(sRouteName, oParams);
			else
				this.getRouter().navTo(sRouteName);
		},

		/**
		 * Method to show messages to users.
		 * Next, values considered to "sType":
		 * 	- "S" -> Success
		 * 	- "W" -> Warning
		 * 	- "E" -> Error
		 *
		 * @public
		 * @param  {string} si18nText Text key
		 * @param  {string} sType Type of alert to be shown.
		 * @param  {function} fnCloseHandler Close handler
		 *
		 */
		alert: function(si18nText, sType, fnCloseHandler, aI18nTextParams) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length,
				sStyleClass = bCompact ? "sapUiSizeCompact" : "",
				sText = this.getResourceBundleText(si18nText, aI18nTextParams);

			fnCloseHandler = fnCloseHandler || function() {};

			switch (sType) {
				case "S":
					MessageBox.success(
						sText, {
							styleClass: sStyleClass,
							onClose: fnCloseHandler.bind(this)
						}
					);
					break;
				case "W":
					MessageBox.warning(
						sText, {
							styleClass: sStyleClass,
							onClose: fnCloseHandler.bind(this)
						}
					);
					break;
				case "E":
					this.getModel("ErrorDialogModel").setProperty("/text", sText);
					if(!this._oErrorDialog){
						this._oErrorDialog = sap.ui.xmlfragment("news.uk.fara.fragment.ErrorDialog", this);
						this.getView().addDependent(this._oErrorDialog);
					}
					this._oErrorDialog.data('onClose', fnCloseHandler);
					jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oErrorDialog);
					this._oErrorDialog.open();
					break;
				case "Simple-E":
					MessageBox.error(
						sText, {
							styleClass: sStyleClass,
							onClose: fnCloseHandler.bind(this)
						}
					);
					break;
				default:
					MessageBox.warning(
						sText, {
							styleClass: sStyleClass,
							onClose: fnCloseHandler.bind(this)
						}
					);
			}

		},

		/**
		 * Close error dialog
		 *
		 * @public
		 * @param  {sap.ui.base.Event} oEvent Route match event
		 */
		onCloseErrorDialogPressed: function(oEvent) {
			this._oErrorDialog.close();
			this._oErrorDialog.data('onClose')();
		},

		/**
		 * Method to show messages to users.
		 * Next, values considered to "sType":
		 * 	- "S" -> Success
		 * 	- "W" -> Warning
		 * 	- "E" -> Error
		 *
		 * @public
		 * @param  {string} si18nText Text key
		 * @param  {string} sType Type of alert to be shown.
		 * @param  {function} fnCloseHandler Close handler
		 *
		 */
		confirm: function(si18nText, fnCloseHandler, aI18nTextParams) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length,
				sStyleClass = bCompact ? "sapUiSizeCompact" : "",
				sText = this.getResourceBundleText(si18nText, aI18nTextParams);

			fnCloseHandler = fnCloseHandler || function() {};

			MessageBox.confirm(
				sText, {
					styleClass: sStyleClass,
					onClose: fnCloseHandler.bind(this)
				}
			);
		},

		/**
		 * Convenience method for getting the event bus.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getEventBus: function() {
			return this.getOwnerComponent().getEventBus();
		},

		/**
		 * Switch on busy indicator in app screens
		 * @public
		 */
		switchOnBusy: function() {
			var oMainPropertiesModel = this.getOwnerComponent().getModel("MainProperties");
			oMainPropertiesModel.setProperty("/busy", true);
		},

		/**
		 * Switch off busy indicator in app screens
		 * @public
		 */
		switchOffBusy: function() {
			var oMainPropertiesModel = this.getOwnerComponent().getModel("MainProperties");
			oMainPropertiesModel.setProperty("/busy", false);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 */
		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			}
		},

		/**
		 * Check if parameter is a valid phone number
		 * @public
		 * @param  {string} sPhoneNumber User phone number
		 * @return {boolean} true, if it is valid. false, in any other case.
		 */
		isValidPhoneNumber: function(sPhoneNumber) {
			var sPhoneNumberNorm = sPhoneNumber.replace("+", "").replace(/\s/g, "");
			return /^[0-9()-]+$/.test(sPhoneNumberNorm);
		},

		/**
		 * Parses a date to DD/MM/YYYY HH:mm:SS string format
		 * @public
		 * @param  {date} dDate date to parse
		 * @param  {boolean} bTime checks if Hours, minutes and seconds should be shown
		 * @return {string} date formatted to string
		 */
		convertDate: function(dDate, bTime) {
			var pad = function(s) { return (s < 10) ? '0' + s : s; };
			var sDDMMYYYY = [pad(dDate.getDate()), pad(dDate.getMonth()+1), dDate.getFullYear()].join('/');
			var sHHmmSS;
			if(bTime){
				sHHmmSS = " " + [pad(dDate.getHours()), pad(dDate.getMinutes()), pad(dDate.getSeconds())].join(':');
			}
			return sDDMMYYYY + sHHmmSS;
		},

		/**
		 * Logout operation
		 *
		 * @public
		 * @param  {sap.ui.base.Event} oEvent Route match event
		 */
		doLogout: function(oEvent) {
			var fFormOpenCallback;
			fFormOpenCallback = function(sCB) {
				if (sCB === sap.m.MessageBox.Action.OK) {
					this.switchOnBusy();
					var auth2 = gapi.auth2.getAuthInstance();
          auth2.signOut().then(function () {
            jQuery.sap.log.info('User signed out.');
         //   this.navTo("Login");
						this.switchOffBusy();
          }.bind(this));
				}
			};
			this.confirm("logout.message", fFormOpenCallback);
		},

		/**
		 * Help Button
		 *
		 * @public
		 * @param  {sap.ui.base.Event} oEvent Route match event
		 */
		doHelp: function(oEvent) {
			var oButton = oEvent.getSource();

      		if (!this._actionSheet) {
        		this._actionSheet = sap.ui.xmlfragment("news.uk.fara.fragment.HelpActions", this);
        		this.getView().addDependent(this._actionSheet);
      		}

      		this._actionSheet.openBy(oButton);
		},

		doOpenUserGuide: function(oEvent) {
      		var URL="https://docs.google.com/presentation/d/1zy4ZAFELoVTSRPHKzC4W3J1Z_d4R-9T4zKYE_Wq__kY";
      		window.open(URL, "_blank");
    	},

    	doOpenPmoPortal: function(oEvent) {
      		var URL="https://sites.google.com/a/news.co.uk/tgechpmoportal/";
      		window.open(URL, "_blank");
    	},

    	doContactPmo: function(oEvent) {
      		var oView = this.getView();
      		var sSubject = this.getResourceBundleText("email.pmo.subject");
      		var sBody = this.getResourceBundleText("email.pmo.body");
      		sap.m.URLHelper.triggerEmail("tech.pmo@news.co.uk", sSubject, sBody);
    	},

    	/**
     	* Report problem to Service Desk
     	*/
    	doReportIssue: function(oEvent)  {
      		var oView = this.getView();
			var sSubject = this.getResourceBundleText("email.support.subject");
      		var sBody = this.getResourceBundleText("email.support.body");
      		sap.m.URLHelper.triggerEmail("ServiceDesk@news.co.uk", sSubject, sBody);
    	},

		/**
		 * Makes "Select All" token invisible
		 * @private
		 * @param  {array} aTokens Select event
		 */
		_invisibleSelectAllToken: function(aTokens){
			for(var i = 0; i < aTokens.length; i++){
				var oToken = aTokens[i];
				if(oToken.getKey() === this.getConstant("selectAllKey")){
					oToken.addStyleClass("invisible");
				}
			}
		},

		/**
		 * Check all selected at cost centers
		 * @private
		 * @param {array} aKeys array of keys
		 */
		_checkSelectedAll: function(aKeys, sModel, sProperty) {
			var aElements = this.getCompModel(sModel).getProperty(sProperty);
			if (!aElements) {
				return false;
			}
			for(var j = 0; j < aElements.length; j++){
				var oElement = aElements[j];
				var sId = oElement.id || oElement.Status;
				if(sId !== this.getConstant("selectAllKey")){
					var bFound = false;
					for(var i = 0; i < aKeys.length && !bFound; i++){
						if(aKeys[i] === sId){
							bFound = true;
						}
					}
					if(!bFound){
						return false;
					}
				}
			}
			return true;
		}

	});

});
