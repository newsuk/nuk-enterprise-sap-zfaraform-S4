sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"news/uk/fara/util/ConfigHelper",
	"news/uk/fara/util/AjaxCaller",
	"news/uk/fara/util/BaseObject"
], function(JSONModel, ConfigHelper, AjaxCaller, BaseObject) {
	"use strict";

	var oInstance;
	const classSingleton = BaseObject.extend("news.uk.fara.util.AppFacade", {

		constructor: function() {

			//Call super constructor
			BaseObject.call(this);

		},

		/**
		 * Make the Ajax call to to get the Auth User Set.
		 * @public
		 * @return {Promise} Promise associatted to the service call execution
		 */
/* 		login: function(sEmail, sToken){
			var oAuth = {
				Email: sEmail,
				Token: sToken
			};

			if(sEmail){
				var oLogin = ConfigHelper.getInstance().login();

				return new AjaxCaller()
					.requestAjax(oLogin.method, oLogin.url, oAuth, null, oLogin.dataType, oLogin.requestedWith)
					.then(function(oData) {
						return oData;
					}.bind(this))
					.catch(function(oData){
						return oData.error;
					}.bind(this));
			}
		} */
	});

	return {

		/**
		 * Method to retrieve single instance for class
		 * @public
		 */
		getInstance: function() {
			if (!oInstance) {
				oInstance = new classSingleton();
			}
			return oInstance;
		}

	};
});
