sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"news/uk/fara/util/BaseObject"
], function(JSONModel, BaseObject) {
	"use strict";

	var oInstance;
	const oClassInstance = BaseObject.extend("news.uk.fara.util.ConfigHelper", {

		/* =========================================================== */
		/* begin: public methods                                     */
		/* =========================================================== */

		/**
		 * Get access to config model from "config.json" file
		 * @public
		 */
		constructor: function() {
			//Call super constructor
			BaseObject.call(this);
		},

		/**
		 * Inits the config model using a config file located on config/config.json
		 * @public
		 */
		loadConfig: function() {
			// var sUrl = "config/config.json";

			// var oHttp = new XMLHttpRequest();
			// oHttp.open('HEAD', sUrl, false);
			// oHttp.send();
			// if(oHttp.status!=404){
			// 	//Load config json
			// 	var oConfigModel = new JSONModel();
			// 	oConfigModel.loadData(sUrl, "", false);
			// 	this._oConfigData = oConfigModel.getData();

			// 	//Build url base
			// 	this._buildUrlBase();
			// } else {
			// 	//Throw an alert if there is no config model
			// 	this.alert("configNotFound", "E");
			// }
		},

		/**
		 * Get working mode.
		 * @public
		 * @return {string} Working mode
		 */
		getWorkingMode: function() {
			return this._oConfigData.mode;
		},

		/**
		 * Get use of mock server
		 * @return {boolean} Use mock server
		 */
		getUseMockServer: function() {
			return this._oConfigData.mockServer;
		},

		/**
		 * Get mock server config
		 * @return {boolean} Use mock server
		 */
		getMockServerConfig: function() {
			return this._oConfigData.mockConfig;
		},

		/**
		 * Get local user for local testing
		 * IMPORTANT, DON'T UPLOAD THIS CONFIG, OR UPLOAD IT EMPTY AT THE JSON FILE
		 * @return {boolean} Use mock server
		 */
		getLocalUser: function() {
			return this._oConfigData.localUser;
		},

		/**
		 * Get use of oDataProxy
		 * @return {boolean} Use mock server
		 */
		getUseoDataProxy: function() {
			return this._oConfigData.oDataProxy;
		},

		/**
		 * Get use of oDataProxy
		 * @return {boolean} Use mock server
		 */
		getoDataProxyConf: function() {
			return this._oConfigData.oDataProxyConf;
		},

		/**
		 * Return url base calculated at initialization of object
		 * @public
		 * @return {string} url based on system
		 */
		getUrlBase: function() {
			return this._sUrlBase;
		},

		/**
		 * Build url to retrieve login ajax call
		 * @public
		 * @return {string}         Complete url considering proxy if it is necessary
		 */
		// login: function() {
		// 	var sCommonPath = this._getCommonPath(),
		// 		oUrls = this._oConfigData.urls.Login,
		// 		sPath = oUrls.path,
		// 		sUrlToNormalize = sCommonPath + "/" + sPath;

		// 	return {
		// 		method: oUrls.method,
		// 		url: this.normalizeUrl(sUrlToNormalize),
		// 		dataType: oUrls.dataType,
		// 		requestedWith: oUrls.requestedWith
		// 	};
		// },


		/**
		 * Build url to retrieve test ajax call
		 * @public
		 * @return {string}         Complete url considering proxy if it is necessary
		 */
		ajaxTest: function() {
			var sCommonPath = this._getCommonPath(),
				oUrls = this._oConfigData.urls.AjaxTest,
				sPath = oUrls.path,
				sUrlToNormalize = "";

				if(sPath.indexOf("http") > -1 && this._oConfigData.mode === "local"){
					sUrlToNormalize = "proxy/" + sPath.replace("http://", "http/");
				} else if(sPath.indexOf("http") > -1) {
					sUrlToNormalize = sPath;
				} else {
					sUrlToNormalize = sCommonPath + "/" + sPath;
				}

			return {
				method: oUrls.TestGet.method,
				url: this.normalizeUrl(sUrlToNormalize)
			};
		},

		/**
		 * Normalize url
		 * - \ -> /
		 * - // -> /
		 * - spaces -> rmeoved
		 * @public
		 * @param  {string} sNoNormalizeUrl Url no normalize
		 * @return {string}                 Url normalized in above sense
		 */
		normalizeUrl: function(sNoNormalizeUrl) {

			return sNoNormalizeUrl
				.replace(/\\/g, "/")
				.replace(/([^:]\/)\/+/g, "$1");

		},

		/**
		 * For local testing prefix with proxy. If you and your team use a special
		 * host name or IP like 127.0.0.1 for localhost  please adapt the
		 * @public
		 * @return {string} "proxy/" prefix if it is localhost,
		 *                  "" in other case.
		 */
		getProxyServiceUrl: function() {
			var sMode = this._oConfigData.mode;

			if (sMode !== "relative" && sMode === "local") {
				//(window.location.hostname == "localhost" || window.location.hostname == "127.0.0.1")) {
				return "proxy/";
			} else {
				return "";
			}
		},

		/**
		 * Return semantic timeout: short, medium & long
		 * @public
		 * @type {string} sTimeoutDuration Timeout duration: "short", "medium" & "long"
		 */
		getTimeout: function(sTimeoutDuration) {
			return this._oConfigData.timeout[sTimeoutDuration];
		},

		/**
		 * Return live search interval in order to re-check if search term has been
		 * changed or not.
		 * @public
		 * @return {int} Live search interval in configuration json file
		 */
		getLiveSearchInterval: function() {
			return parseInt(parseFloat(this._oConfigData.liveSearchInterval) * 1000);
		},



		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Get an url like "https://<host>:port" based on working mode and system
		 * configuration.
		 *
		 * When "sMode" internally configured to use "relative" mode,
		 * then it is not necessary to build absolute URL, so empty string is
		 * returns.
		 *
		 * Method save "urlBase" built at "_sUrlBase".
		 *
		 * @private
		 */
		_buildUrlBase: function() {

			var sMode = this._oConfigData.mode,
				sHttps = (this._oConfigData.https === "true") ? "https" : "http",
				oSystems = this._oConfigData.environments;

			switch (sMode) {

				case "relative":
				case "local":

					this._sUrlBase = "";
					break;

				default:

					if (!sMode)
						sMode = "dev";

					var oEnvironmentInfo = oSystems[sMode],
						sHostname = oEnvironmentInfo.host,
						sPort = oEnvironmentInfo.port;

					this._sUrlBase = sHttps + "://" + sHostname + ":" + sPort;

					break;
			}

		},

		/**
		 * Get common url path for app
		 * @private
		 * @return {string} Get common context path
		 */
		_getCommonPath: function() {
			var sMode = this._oConfigData.mode,
				sProxy = this.getProxyServiceUrl(),
				sUrlBase = this.getUrlBase(),
				sContextPath = "";

			switch (sMode) {

				case "relative":
					// sContextPath = this._oConfigData.urls.relpath.substring(1);
					sContextPath = this._oConfigData.urls.relpath;
					break;

				default:
					sContextPath = this._oConfigData.urls.path + this._oConfigData.urls.relpath;
					break;
			}

			return sProxy + sUrlBase + sContextPath;
		}

	});

	return {
		/**
		 * Method to retrieve single instance for class
		 * @public
		 * @return {com.vf.instant.feedback.app.utils.ConfigHelper} 		ConfigHelp singleton instance
		 */
		getInstance: function() {
			if (!oInstance) {
				oInstance = new oClassInstance();
			}
			return oInstance;
		}
	};
});
