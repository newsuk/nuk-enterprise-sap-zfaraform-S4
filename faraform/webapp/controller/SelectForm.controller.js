sap.ui.define([
	"news/uk/fara/controller/BaseController",
	"sap/m/Image",
	"sap/m/Button"
], function(BaseController, Image, Button) {
	"use strict";

	return BaseController.extend("news.uk.fara.controller.SelectForm", {

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
			var oRouter = this.getRouter(),
				oRouteWaiting = oRouter.getRoute("WaitingApproval"),
				oRouteMaster = oRouter.getRoute("Master");
			oRouteWaiting.attachMatched(this.onRouteMatchedMaster, this);
			oRouteMaster.attachMatched(this.onRouteMatchedMaster, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Recovers MessagePage object and updates it's toolbar
		 * Important Note: Matched only to "Master" route
		 * @public
		 * @param  {sap.ui.base.Event} oEvent Route match event
		 */
		onRouteMatchedMaster: function(oEvent) {
			this.getModel("CurrentUrlModel").setProperty("/currentURL", undefined);
			var oMessagePage = this.byId("SelectForm");
			//Get header
			var oHeader = oMessagePage._getInternalHeader();
			if(!oHeader.hasStyleClass("header")){
				oHeader.addStyleClass("header");
			}
			if(oHeader.getContentRight().length === 0) {
				oHeader.addContentRight(new Button({
					tooltip:"{i18n>help.tooltip}",
					icon:"sap-icon://sys-help",
					press: this.doHelp.bind(this)
				}));
				oHeader.addContentRight(new Button({
					tooltip:"{i18n>logout.tooltip}",
					icon:"sap-icon://log",
					press: this.doLogout.bind(this)
				}));
				oHeader.addContentRight(new Image({
					src:"{FaraFormProperties>/newsUKLogoURL}",
					width:"115px",
					height:"30px"
				}));
			}
		}

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

	});

});
