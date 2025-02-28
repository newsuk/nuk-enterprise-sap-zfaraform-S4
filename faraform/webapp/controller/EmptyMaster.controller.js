sap.ui.define([
	"news/uk/fara/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, JSONModel, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("news.uk.fara.controller.EmptyMaster", {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function() {
			// Polyfill for find function, just in case
			if (!Array.prototype.find) {
				Array.prototype.find = function(predicate) {
					'use strict';
					if (this == null) {
						throw new TypeError('Array.prototype.find called on null or undefined');
					}
					if (typeof predicate !== 'function') {
						throw new TypeError('predicate must be a function');
					}
					var list = Object(this);
					var length = list.length >>> 0;
					var thisArg = arguments[1];
					var value;

					for (var i = 0; i < length; i++) {
						value = list[i];
						if (predicate.call(thisArg, value, i, list)) {
							return value;
						}
					}
					return undefined;
				};
			}

			//Initialize screen in each navigation
			//Match only with "dashboard" pattern
		//	var oRouter = this.getRouter();
			//oRouteLogin = oRouter.getRoute("Login"),
		//	oRouteLaunchpad = oRouter.getRoute("Launchpad");
		//	oRouteLogin.attachMatched(this.onRouteMatchedLogin, this);
			//oRouteLaunchpad.attachMatched(this.onRouteMatchedLaunchpad, this);
		//	oRouter.attachBypassed(this.onRouteBypassed, this);
		var oRouter = this.getRouter(),
				oRouteLogin = oRouter.getRoute("Launchpad");
			oRouteLogin.attachMatched(this.onRouteMatchedLaunchpad, this);
			oRouter.attachBypassed(this.onRouteBypassed, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Makes this section invisble.
		 * Important Note: Matched only to "Login" route
		 * @public
		 * @param  {sap.ui.base.Event} oEvent Route match events
		 */
		onRouteMatchedLogin: function(oEvent) {
			this.getView().getParent().addStyleClass("invisible");
		},
		onRouteMatchedLaunchpad: function(oEvent) {
			//if(!this.getCompModel("user") || !this.getCompModel("user").oData.d.UserName){
				this.getModel("CurrentUrlModel").setProperty("/currentURL", "Launchpad");
			//	this.navTo("Login");
			//}
		},
		onRouteBypassed: function(oEvent) {
			 this.getView().getParent().addStyleClass("invisible");
		},
    
		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

	});

});
