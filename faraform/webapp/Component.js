sap.ui.define([
	"sap/ui/core/UIComponent",
	"news/uk/fara/services/AppFacade",
	"news/uk/fara/util/ConfigHelper",
	"news/uk/fara/util/AjaxCaller",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/core/util/MockServer"
], function(UIComponent, AppFacade, ConfigHelper, AjaxCaller, Device, JSONModel, ODataModel, MockServer){
	"use strict";
	return UIComponent.extend('news.uk.fara.Component', {
		metadata: {
			manifest: "json"
		},

		//manifest.json Option without login
		// {
		// 	"pattern": "",
		// 	"name": "Master",
		// 	"target": ["SelectForm", "Master"]
		// },


		//manifest.json Option with login
		// {
		// 	"pattern": "",
		// 	"name": "Login",
		// 	"target": ["Login", "EmptyMaster"]
		// },
		// {
		// 	"pattern": "Start",
	 	//"name": "Master",
		//	"target": ["SelectForm", "Master"]
		//},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// initialize all utilities class to have access to owner component
			this._initializeBaseObjectSingletonClasses();

			// call the base component's init function
			UIComponent.prototype.init.apply(this);

			// set the device model
			this.setModel(new JSONModel(Device), "device");

			if(window.location.href.indexOf("localhost") > -1){
				this._sLocalUser = ConfigHelper.getInstance().getLocalUser();
			}

			// Initialize router
			this.getRouter().initialize();
		},

		initODataModel: function(sEmail = "None", sToken = "None") {
			// Gateway Service URI
			// First version, without alias
			// var sGWServiceURI = this.getMetadata().getManifest()["sap.app"].dataSources.zod_fara.forms.srv.uri;

			// New version starting 13-07-2017, using alias
		//	var sGWServiceURI = this.getMetadata().getManifest()["sap.app"].dataSources.FINALGWSERVICE.uri;
		var sGWServiceURI = this.getMetadata().getManifest()["sap.app"].dataSources.zod_fara_forms_srv.uri;
			// Initialize oDataModel
			this._initOdataModel(sGWServiceURI, sEmail, sToken);
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Initialize owner component when necessary
		 * @private
		 */
		_initializeBaseObjectSingletonClasses: function() {
			AppFacade.getInstance().setOwnerComponent(this);
			ConfigHelper.getInstance().setOwnerComponent(this);
			ConfigHelper.getInstance().loadConfig();
		},

		/**
		 * Initialize main oDataModel
		 * @private
		 */
		_initOdataModel: function(sSource, sEmail, sToken){
			// Use mock server if indicated
			var sServerUrl;
			var mParams = {
				json: true
			};
			if(ConfigHelper.getInstance().getUseMockServer()){
				var oMockServerconfig = ConfigHelper.getInstance().getMockServerConfig();

				sServerUrl = /.*\/$/.test(sSource) ? sSource : sSource + "/";
				var oMockServer = new MockServer({
						rootUri: sServerUrl,
				});
				MockServer.config({
					autoRespond: oMockServerconfig.autoRespond,
					autoRespondAfter: oMockServerconfig.autoRespondAfter
				});
				oMockServer.simulate(oMockServerconfig.baseURL+oMockServerconfig.metadata, {
					sMockdataBaseUrl: oMockServerconfig.baseURL,
					bGenerateMissingMockData: oMockServerconfig.generateMissingMockData
				});
				oMockServer.start();

				console.warn("Running with mockserver");
			} else if(ConfigHelper.getInstance().getUseoDataProxy()){
				var oConfig = ConfigHelper.getInstance().getoDataProxyConf();
				sServerUrl = oConfig.url;

				console.warn("Running with proxy");
			}
            // setting up model
            var oModel = new ODataModel(sServerUrl || sSource, mParams);
			oModel.setHeaders({
                "X-Requested-With":"X",
			    "NewsUK-Fara-Auth-Email": sEmail,
			    "NewsUK-Fara-Auth-Token": sToken
            });
			this.setModel(oModel);
		}

	});
});
