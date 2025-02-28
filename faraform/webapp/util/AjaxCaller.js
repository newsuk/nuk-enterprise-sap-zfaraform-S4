sap.ui.define([
	"news/uk/fara/util/ConfigHelper",
	"news/uk/fara/util/BaseObject"
], function(ConfigHelper, BaseObject) {
	"use strict";

	return BaseObject.extend("news.uk.fara.util.AjaxCaller", {

		/**
		 * Makes the pertinent Ajax request
		 * @public
		 * @param  {string} sMethod          Method type: GET, POST, PUT...
		 * @param  {string} sUrl             Url for the Ajax call
		 * @param  {Object} oValues          Object with the values to send on the Ajax call
		 * @param  {string} sTimeoutDuration Timeout string value defined on config file (config/config.json)
		 * @param  {string} sDataType        Type of the data to define the Content-Type of the call. Actually accepts json and xml
		 * @return {Promise}                 Promise containing Ajax call
		 */
		requestAjax: function(sMethod, sUrl, oValues, sTimeoutDuration, sDataType, bRequestedWith) {

			return this._doAjaxCall(sMethod.toUpperCase(), sUrl, oValues, sTimeoutDuration, sDataType, bRequestedWith);

		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Makes Ajax call within a Promise, returning this Promise object.
		 * @private
		 * @param  {string} sMethod          Method type: GET, POST, PUT...
		 * @param  {string} sUrl             Url for the Ajax call
		 * @param  {Object} oValues          Object with the values to send on the Ajax call
		 * @param  {string} sTimeoutDuration Timeout string value defined on config file (config/config.json)
		 * @param  {string} sDataType        Type of the data to define the Content-Type of the call. Actually accepts json and xml
		 * @return {Promise}                 Promise containing Ajax call
		 * @private
		 */
		_doAjaxCall: function(sMethod, sUrl, oValues, sTimeoutDuration, sDataType, bRequestedWith) {

			sDataType = sDataType || "json";
			oValues = oValues || "";
			sTimeoutDuration = sTimeoutDuration || "short";

			var sContentType = "";
			if (sDataType === "json") {
				sContentType = "application/json; charset=UTF-8";
			} else if (sDataType === "xml") {
				sContentType = "application/xml; charset=UTF-8";
			} else {
				sContentType = "application/x-www-form-urlencoded; charset=UTF-8";
			}

			var oFormattedValues;
			if (oValues instanceof Blob || !oValues) {
				oFormattedValues = oValues;
				sDataType = null;
			} else {
				oFormattedValues = JSON.stringify(oValues);
			}

			var sXRequestedWith = bRequestedWith ? "X" : "";

			return new Promise(function(resolve, reject) {

				if (!navigator.onLine) {
					//Send NO NETWORK available
					reject({
						id: "NO_NETWORK",
						error: {}
					});
				}

				jQuery.ajax({
					cache: false,
					crossDomain: false,
					timeout: ConfigHelper.getInstance().getTimeout(sTimeoutDuration),
					type: sMethod,
					url: sUrl,
					headers: {
						"Content-Type": sContentType,
						"X-Requested-With": sXRequestedWith,
					},
					dataType: sDataType,
					processData: false,
					data: oFormattedValues,
					success: function(response) {
						//Send response
						resolve(response);
					},
					error: function(jqXHR, textStatus) {
						if (textStatus === "timeout") {
							//Send TIMEOUT obtained
							reject({
								id: "TIMEOUT",
								error: {}
							});

						} else {

							//Send complete error to evaluate what to do
							reject({
								id: "HTTP_ERROR",
								error: jqXHR
							});
						}

					}

				});

			}.bind(this));

		}

	});

});
