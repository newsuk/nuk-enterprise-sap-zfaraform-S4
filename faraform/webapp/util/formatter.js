sap.ui.define([
], function() {
	"use strict";

	return {

		/**
		 * Returns i18n property value.
		 * @public
		 * @param {array} arguments list of arguments recovered. There should be a minimum of two arguments.
		 * @returns {string} i18n Property value
		 */
		i18n: function() {
			var args = [].slice.call(arguments);
			if (args.length > 1) {
				var key = args.shift();
				// Get the component and execute the i18n function
				if(key) return this.getResourceBundle().getText(key, args);
				else return "";
			}
			return "";
		},

		/**
 		 * Parses a date to DD/MM/YYYY HH:mm:SS string format
 		 * @public
 		 * @param {date} dDate date to format
 		 * @returns {string} date formatted to string
 		 */
		formatDate: function(dDate) {
			if(dDate){
				return this.convertDate(dDate, true);
			} else {
				return "";
			}
		},

		/**
 		 * Checks WorkItemID to see if Approve and Reject buttons must be shown.
 		 * If it's value is 000000000000, the buttons won't be shown, it it's another value, they will show
 		 * @public
 		 * @param {string} sWorkItemId Work Item ID to check.
 		 * @returns {boolean} show or don't show the buttons
 		 */
		approveRejectVisible: function(sWorkItemId) {
			if(sWorkItemId){
				return sWorkItemId !== "000000000000";
			} else {
				return false;
			}
		},

    /**
    * Format cost centre description
    *
    * @public
    * @param {string} sID Cost center ID
    * @param {string} sName Cost center name
    * @returns {string} Formatted cost center name
    * */
    formatCostCenterDesc: function(sID, sName) {
      var sDesc = sID || this.getResourceBundle().getText("faraForm.costCenter.None");
      if (sName) {
        sDesc += " - " + sName;
      }
      return sDesc;
    },

		/**
 		 * Formats status for the form
 		 * @public
 		 * @param {string} sStatusID Status ID to check.
 		 * @returns {string} status description
 		 */
		formatStatus: function(sStatusID) {
			var aStatus = this.getCompModel("FormsStatus").getProperty("/formsStatus");
			for(var i = 0; i < aStatus.length; i++){
				var oStatus = aStatus[i];
				if(oStatus.Status === sStatusID){
					return oStatus.StatusDescription;
				}
			}
			return sStatusID;
		},

		/**
 		 * If it's a new form (no status) the text will be "Submit"
 		 * If it's a created form (any status) the text will be "Update"
 		 * @public
 		 * @param {string} sStatusID Status ID to check.
 		 * @returns {string} text for submit button
 		 */
		submitButtonText: function(sStatusID) {
			if(sStatusID !== null){
				return this.getResourceBundleText("faraForm.update");
			} else {
				return this.getResourceBundleText("faraForm.submit");
			}
		},

		/**
 		 * Returns the opposite of the received boolean
 		 * @public
 		 * @param {string} sStatusID Status ID to check.
 		 * @returns {string} text for submit button
 		 */
		opposite: function(bBoolean) {
			return !bBoolean;
		}

	};

});
