sap.ui.define([
	"sap/ui/base/Object",
	"sap/m/MessageBox"
], function(Object, MessageBox) {
	"use strict";

	return Object.extend("news.uk.fara.util.BaseObject", {

		/**
		 * Return a reference to the owner component
		 * @public
		 * @return {sap.ui.core.Component} Owner component
		 */
		getOwnerComponent: function() {
			return this._oOwnerComponent;
		},


		/**
		 * Register owner component to the created object
		 * @public
		 * @param  {sap.ui.core.Component} oOwnerComponent Owner component for current object
		 * @return {sap.ui.core.Component} Builder pattern, return that it was set
		 */
		setOwnerComponent: function(oOwnerComponent) {
			return this._oOwnerComponent = oOwnerComponent;
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this._oOwnerComponent.getModel("i18n").getResourceBundle();
		},

		/**
		 * Convenience method for getting a resource bundle text.
		 * @param  {string} sText Name of the resource bundle property
		 * @return {string} String text corresponding to the sText property
		 */
		getResourceBundleText: function(sText) {
			return this.getResourceBundle().getText(sText);
		},

		/**
		 * Method to show messages to users.
		 * Next, values considered to "sType":
		 * 	- "S" -> Success
		 * 	- "W" -> Warning
		 * 	- "E" -> Error
		 * @public
		 * @param  {string} si18nText Text key
		 * @param  {string} sType Type of alert to be shown.
		 * @param  {function} fnCloseHandler Close handler
		 *
		 */
		alert: function(si18nText, sType, fnCloseHandler) {
			var sStyleClass = "",
				sText = this.getResourceBundleText(si18nText);

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

		}

	});

});
