sap.ui.define([
], function() {
	"use strict";

	return {

		/**
		 * Generic liveChange format for phone number.
		 * @public
		 * @param {sap.ui.base.Event} oEvent Livechange event.
		 */
     liveChangeInputPhoneNumber: function(oEvent) {
       var oInput = oEvent.getSource();
       var sValue = oEvent.getParameter("newValue");

       //First checks '+' character with unicode value (\u002B) and numbers
       var fRegex = /(?!\u002B)[^0-9.]/g;

       var sFinalValue = sValue.replace(fRegex, "");

       //Checks occurrences for '+' character
       var iCoincidences = (sFinalValue.match(/\u002B/g) || []).length;

       //Checks if '+' occurrence is at the start
       if(iCoincidences == 1 && !sFinalValue.startsWith("+")){
         sFinalValue = sFinalValue.replace("+","");
       } else if(iCoincidences > 1){
         //Saves if number starts with '+'
         var bStartsWithPlus = sFinalValue.startsWith("+");

         //Removes every '+' occurrence
         while(sFinalValue.indexOf("+") > -1) sFinalValue = sFinalValue.replace("+","");

         //If number started with '+', it's added again
         if(bStartsWithPlus) sFinalValue = "+" + sFinalValue;
       }

       //Updates value with formatted number if there has been any changes
       oInput.setValue(sFinalValue);
       oInput.fireChange({newValue: sFinalValue});
     },

     /**
 		 * Generic change format for phone number.
 		 * @public
 		 * @param {sap.ui.base.Event} oEvent Change event.
 		 */
     changeInputPhoneNumber: function(oEvent) {
       var oInput = oEvent.getSource();
       var sValue = oEvent.getParameter("newValue");

       var iMinLength;
       var sErrorMessage;

       if(sValue.length === 0){
         oInput.setValueState("None").setValueStateText("");
       } else {
         if(sValue.indexOf("+") > -1){
           //if phone number contains a +, it's an international number, so the minimum digit length is 8 (comparison with 9 because of + character)
           iMinLength = 9;
           sErrorMessage = this.getResourceBundleText("inputPhoneInternationalFormatError");
         } else {
           //if phone number doesn't contain a +, it isn't an international number, so the minimum digit length is 4
           iMinLength = 4;
           sErrorMessage = this.getResourceBundleText("inputPhoneNationalFormatError");
         }

         if(sValue.length >= iMinLength) {
           //If email is OK, valueState is reset
           oInput.setValueState("None").setValueStateText("");
         } else {
           //If email is not OK, valueState is set to error with an indicative message
           oInput.setValueState("Error").setValueStateText(sErrorMessage);
         }
       }
     },

     /**
 		 * Generic liveChange format for email.
 		 * @public
 		 * @param {sap.ui.base.Event} oEvent Livechange event.
 		 */
     liveChangeInputEmail: function(oEvent) {
       var oInput = oEvent.getSource();
       var sValue = oEvent.getParameter("newValue");
       oInput.fireChange({newValue: sValue});
     },

     /**
 		 * Generic change format for email.
 		 * @public
 		 * @param {sap.ui.base.Event} oEvent Change event.
 		 */
     changeInputEmail: function(oEvent) {
       var oInput = oEvent.getSource();
       var sValue = oEvent.getParameter("newValue");

       if(sValue.length === 0){
         oInput.setValueState("None").setValueStateText("");
       } else {
         //Regex expression for checking email
         var fRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

         if(fRegex.test(sValue)){
           //If email is OK, valueState is reset
           oInput.setValueState("None").setValueStateText("");
         } else {
           //If email is not OK, valueState is set to error with an indicative message
           oInput.setValueState("Error").setValueStateText(this.getResourceBundleText("inputEmailFormatError"));
         }
       }
     }
	};

});
