sap.ui.define([
	"news/uk/fara/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter"
], function(BaseController, JSONModel, Filter, FilterOperator, Sorter) {
	"use strict";

	return BaseController.extend("news.uk.fara.controller.Master", {

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
				oRouteMaster = oRouter.getRoute("Master"),
				oRouteWaiting = oRouter.getRoute("WaitingApproval"),
				oRouteBase = oRouter.getRoute("Base"),
				oRouteCreateFaraForm = oRouter.getRoute("CreateFaraForm"),
				oRouteFaraForm = oRouter.getRoute("FaraForm"),
				oRouteFaraFormApprove = oRouter.getRoute("FaraFormApprove");
			oRouteMaster.attachMatched(this.onRouteMatchedMaster, this);
			oRouteWaiting.attachMatched(this.onRouteMatchedWaiting, this);
			oRouteBase.attachMatched(this.onRouteMatchedBase, this);
			oRouteCreateFaraForm.attachMatched(this.onRouteMatchedCreateFaraForm, this);
			oRouteFaraForm.attachMatched(this.onRouteMatchedFaraForm, this);
			oRouteFaraFormApprove.attachMatched(this.onRouteMatchedFaraFormApprove, this);

			//Event to reload form list and load a form
			this.getEventBus().subscribe("FaraForm", "ReloadFormsAfterCreateUpdate", this._reloadForms, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Initializations.
		 * Important Note: Matched only to "Master" route
		 * @public
		 * @param  {sap.ui.base.Event} oEvent Route match events
		 */
		onRouteMatchedMaster: function(oEvent) {
			this.getCompModel("FaraFormProperties").setProperty("/myForms", true);
			this._sCurrent = "Master";
			this._deselectForm();

			this.getCompModel("FormsFilterModel").setProperty("/dateFrom", null);
			this.getCompModel("FormsFilterModel").setProperty("/dateTo", null);
			this.getCompModel("FormsFilterModel").setProperty("/statusKeys", []);

			if(!this.getCompModel("user") || !this.getCompModel("user").oData.d.UserName){
				this.getModel("CurrentUrlModel").setProperty("/currentURL", "Master");
				//this.navTo("Login");
			} else {
				this.getView().getParent().removeStyleClass("invisible");
				jQuery.sap.delayedCall("100", this, function() {
					this.switchOnBusy();

					this._loadFormsStatus()
						.then(function() {
							this._loadForms()
								.then(function() {
									this._sortForms();
									this.switchOffBusy();
								}.bind(this))
								.catch(function(oError) {
									this.alert(
										"faraForm.models.formsList",
										"E",
										function() {
											this.switchOffBusy();
										}.bind(this), [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]
									);
								}.bind(this));
						}.bind(this))
						.catch(function(oError) {
							this.alert(
								"faraForm.models.formsStatusList",
								"E",
								function() {
									this.switchOffBusy();
								}.bind(this), [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]
							);
						}.bind(this));

					this._formOpenAndCreation(false, false);
				});
			}
		},

		/**
		 * Initializations.
		 * Important Note: Matched only to "WaitingApproval" route
		 * @public
		 * @param  {sap.ui.base.Event} oEvent Route match events
		 */
		onRouteMatchedWaiting: function(oEvent) {
			this.getCompModel("FaraFormProperties").setProperty("/myForms", false);
			this._sCurrent = "WaitingApproval";
			this._deselectForm();

			if(!this.getCompModel("user") || !this.getCompModel("user").oData.d.UserName){
				this.getModel("CurrentUrlModel").setProperty("/currentURL", "WaitingApproval");
			//	this.navTo("Login");
			} else {
				this.getView().getParent().removeStyleClass("invisible");
				jQuery.sap.delayedCall("100", this, function() {
					this.switchOnBusy();

					this._loadFormsStatus()
						.then(function() {
							this._loadForms()
								.then(function() {
									this._sortForms();
									this.switchOffBusy();
								}.bind(this))
								.catch(function(oError) {
									this.alert(
										"faraForm.models.formsList",
										"E",
										function() {
											this.switchOffBusy();
										}.bind(this), [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]
									);
								}.bind(this));
						}.bind(this))
						.catch(function(oError) {
							this.alert(
								"faraForm.models.formsStatusList",
								"E",
								function() {
									this.switchOffBusy();
								}.bind(this), [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]
							);
						}.bind(this));

					this._formOpenAndCreation(false, false);
				});
			}
		},

		/**
		 * Just redirect to "".
		 * Important Note: Matched only to "Base" route
		 * @public
		 * @param  {sap.ui.base.Event} oEvent Route match events
		 */
		onRouteMatchedBase: function(oEvent) {
			this.getView().getParent().removeStyleClass("invisible");
			var oFormSelected = this.byId("formsList").getSelectedItem();
			if (!oFormSelected) {
				var sNavTo = this._sCurrent ? this._sCurrent : "Master";
				this.navTo(sNavTo);
			}

			this._formOpenAndCreation(false, false);
		},

		/**
		 * Initializations of FaraForm item.
		 * Important Note: Matched to "CreateFaraForm" route
		 * @public
		 * @param  {sap.ui.base.Event} oEvent Route match events
		 */
		onRouteMatchedCreateFaraForm: function(oEvent) {
			this.getCompModel("FaraFormProperties").setProperty("/myForms", true);
			if(!this.getCompModel("user") || !this.getCompModel("user").oData.d.UserName){
				this.getModel("CurrentUrlModel").setProperty("/currentURL", "CreateFaraForm");
			//	this.navTo("Login");
			} else {
				this.getView().getParent().removeStyleClass("invisible");
				this.switchOnBusy();

				this._loadFormsStatus()
					.then(function() {
						this._loadForms()
							.then(function() {
								this._sortForms();
								this._deselectForm();
								this.switchOffBusy();
							}.bind(this))
							.catch(function(oError) {
								this.alert(
									"faraForm.models.formsList",
									"E",
									function() {
										this.switchOffBusy();
									}.bind(this), [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]
								);
							}.bind(this));
					}.bind(this))
					.catch(function(oError) {
						this.alert(
							"faraForm.models.formsStatusList",
							"E",
							function() {
								this.switchOffBusy();
							}.bind(this), [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]
						);
					}.bind(this));

				this._formOpenAndCreation(true, true);
			}
		},

		/**
		 * Initializations and selection of FaraForm item.
		 * Important Note: Matched to "FaraForm" route
		 * @public
		 * @param  {sap.ui.base.Event} oEvent Route match events
		 */
		onRouteMatchedFaraForm: function(oEvent) {
			var bChanged = false;
			if(!this.getCompModel("FaraFormProperties").getProperty("/myForms")){
				bChanged = true;
			}
			this.getCompModel("FaraFormProperties").setProperty("/myForms", true);
			if(!this.getCompModel("user") || !this.getCompModel("user").oData.d.UserName){
				this.getModel("CurrentUrlModel").setProperty("/currentURL", "FaraForm");
				this.getModel("CurrentUrlModel").setProperty("/id", oEvent.getParameter("arguments").id);
			//	this.navTo("Login");
			} else {
				this.getView().getParent().removeStyleClass("invisible");
				var sId = oEvent.getParameter("arguments").id;

				this.switchOnBusy();

				if (this.getCompModel("FormsModel").getProperty("/forms")
				&& this.getCompModel("FormsModel").getProperty("/forms").length > 0
				&& !bChanged) {
					this.getEventBus().publish("FaraForm", "LoadForm", {
						id: sId
					});
				} else {
					//Form is loaded calling a private function that reloads the list and load the selected one
					this._reloadFormsAfterCreateUpdate(sId, function() {
						this.getEventBus().publish("FaraForm", "LoadForm", {
							id: sId
						});
					}.bind(this));
				}

				this._formOpenAndCreation(true, false);
			}
		},

		/**
		 * Initializations and selection of FaraForm item from Waiting option.
		 * Important Note: Matched to "FaraFormApprove" route
		 * @public
		 * @param  {sap.ui.base.Event} oEvent Route match events
		 */
		onRouteMatchedFaraFormApprove: function(oEvent) {
			var bChanged = false;
			if(this.getCompModel("FaraFormProperties").getProperty("/myForms")){
				bChanged = true;
			}

			this.getCompModel("FaraFormProperties").setProperty("/myForms", false);
			if(!this.getCompModel("user") || !this.getCompModel("user").oData.d.UserName){
				this.getModel("CurrentUrlModel").setProperty("/currentURL", "FaraFormApprove");
				this.getModel("CurrentUrlModel").setProperty("/id", oEvent.getParameter("arguments").id);
			//	this.navTo("Login");
			} else {
				this.getView().getParent().removeStyleClass("invisible");
				var sId = oEvent.getParameter("arguments").id;

				this.switchOnBusy();

				if (this.getCompModel("FormsModel").getProperty("/forms")
				&& this.getCompModel("FormsModel").getProperty("/forms").length > 0
				&& !bChanged) {
					this.getEventBus().publish("FaraForm", "LoadForm", {
						id: sId
					});
				} else {
					//Form is loaded calling a private function that reloads the list and load the selected one
					this._reloadFormsAfterCreateUpdate(sId, function() {
						this.getEventBus().publish("FaraForm", "LoadForm", {
							id: sId
						});
					}.bind(this));
				}

				this._formOpenAndCreation(true, false);
			}
		},

		/**
		 * Launch Master Filter.
		 * @public
		 * @param  {sap.ui.base.Event} oEvent Route match events
		 */
		onPressMasterFilter: function(oEvent) {
			if (!this._oFilterDialog) {
				this._oFilterDialog = sap.ui.xmlfragment("news.uk.fara.fragment.MasterFilterDialog", this);
				this.getView().addDependent(this._oFilterDialog);
			}
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oFilterDialog);
			this._oFilterDialog.open();
		},

		/**
		 * Filter forms.
		 * @public
		 * @param  {sap.ui.base.Event} oEvent Route match events
		 */
		onFilterPressed: function(oEvent) {
			this.switchOnBusy();
			this._loadForms()
				.then(function() {
					this._sortForms();
					this.switchOffBusy();
					this._oFilterDialog.close();
				}.bind(this))
				.catch(function(oError) {
					this.alert(
						"faraForm.models.formsList",
						"E",
						function() {
							this.switchOffBusy();
						}.bind(this), [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]
					);
				}.bind(this));
		},

		/**
		 * Cancel Filter forms.
		 * @public
		 * @param  {sap.ui.base.Event} oEvent Route match events
		 */
		onCancelFilterPressed: function(oEvent) {
			this._oFilterDialog.close();
		},

		/**
		 * Trigger search for specific forms.
		 * @public
		 * @param {sap.ui.base.Event} oEvent - Input changed event.
		 */
		onSearch: function(oEvent) {
			var oModel = this.getCompModel("FormsModel");

			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter([
							new Filter("FormID", FilterOperator.Contains, sQuery),
              new Filter("UserIdReqAccess", FilterOperator.Contains, sQuery),
              new Filter("UserIdReqAccessName", FilterOperator.Contains, sQuery)
        ]);
        aFilters.push(filter);
			}

			// update list binding
			var oList = this.byId("formsList");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilters);
		},

		/**
		 * Trigger form selected, so it must load detail page.
		 * @public
		 * @param  {sap.ui.base.Event} oEvent - Input RadioButton selected.
		 */
		onFormSelected: function(oEvent) {
			var sId = oEvent.getParameter("listItem").getBindingContext("FormsModel").getProperty("FormID");
			// var sUrl = "FaraForm";
			var sUrl = this.getCompModel("FaraFormProperties").getProperty("/myForms") ? "FaraForm" : "FaraFormApprove";

			this.navTo(sUrl, {
				id: sId
			});
		},

		/**
		 * Creates a new form.
		 * @public
		 * @param  {sap.ui.base.Event} oEvent Route match events
		 */
		onNewFormPress: function(oEvent) {
			var oWorkItemId = {};
			this.getEventBus().publish("FaraForm", "GetWorkItemID", oWorkItemId);

			if ((this._formOpen && this._createFaraForm) || (this._formOpen && oWorkItemId.id !== "000000000000")) {
				var fFormOpenCallback;
				fFormOpenCallback = function(sCB) {
					if (!this._createFaraForm) {
						if (sCB === sap.m.MessageBox.Action.OK) {
							this.getEventBus().publish("FaraForm", "Reload");
							this.navTo("CreateFaraForm");
						}
					} else {
						if (sCB === sap.m.MessageBox.Action.OK) {
							this.getEventBus().publish("FaraForm", "Reload");
						}
					}
				};
				this.confirm("master.formIsOpen", fFormOpenCallback);
			} else {
				this.getEventBus().publish("FaraForm", "Reload");
				this.navTo("CreateFaraForm");
			}
		},

		/**
		 * Event when elem is selected.
		 * @public
		 * @param  {sap.ui.base.Event} oEvent Selection Change event
		 */
		onFilterElementSelected: function(oEvent) {
			this.switchOnBusy();
			var oChangedItem = oEvent.getParameter("changedItem");
			var oMultiComboBox = oEvent.getSource();
			if (oChangedItem.getKey() === this.getConstant("selectAllKey")) {
				var bSelected = oEvent.getParameter("selected");

				if (bSelected) {
					oMultiComboBox.setSelectedItems(oMultiComboBox.getItems());
				} else {
					oMultiComboBox.setSelectedItems();
				}
			} else if (!oEvent.getParameter("selected")) {
				oMultiComboBox.removeSelectedItem(oMultiComboBox.getFirstItem());
			} else {
				var aSelectedKeys = this.getCompModel("FormsFilterModel").getProperty(oMultiComboBox.getBindingPath("selectedKeys"));

				var oBindingInfo = oMultiComboBox.getBindingInfo("items");
				if (this._checkSelectedAll(aSelectedKeys, oBindingInfo.model, oBindingInfo.path)) {
					oMultiComboBox.setSelectedItems(oMultiComboBox.getItems());
				}
			}

			var aTokens = oMultiComboBox._oTokenizer.getTokens();
			this._invisibleSelectAllToken(aTokens);

			this.switchOffBusy();
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Sorts forms list
		 * @private
		 */
		_sortForms: function() {
			this.switchOnBusy();
			var oBinding = this.byId("formsList").getBinding("items");
			var oSorter = new Sorter("LastChangedOn", true);
			// var oSorter = new Sorter("CreatedOn", true);
			oBinding.sort(oSorter);
			this.switchOffBusy();
		},

		/**
		 * Loads forms list
		 * @private
		 */
		_loadForms: function() {
			return new Promise(function(resolve, reject) {
				var aFilters = [];

				var oDateFilter;
				var oFullFilter;

				var dDateTo;
				var dDateFrom;

				var bMyForms = this.getCompModel("FaraFormProperties").getProperty("/myForms");

				if(bMyForms) {

					if (!this.getCompModel("FormsFilterModel").getProperty("/dateFrom")
					&& !this.getCompModel("FormsFilterModel").getProperty("/dateTo")) {
						dDateTo = new Date();
						dDateFrom = new Date(dDateTo.getTime());
						dDateFrom.setMonth(dDateTo.getMonth() - 1);

						dDateTo.setHours(23);
						dDateTo.setMinutes(59);
						dDateTo.setSeconds(59);
						dDateFrom.setHours(0);
						dDateFrom.setMinutes(0);
						dDateFrom.setSeconds(0);

						this.getCompModel("FormsFilterModel").setProperty("/dateFrom", dDateFrom);
						this.getCompModel("FormsFilterModel").setProperty("/dateTo", dDateTo);
					} else if (!this.getCompModel("FormsFilterModel").getProperty("/dateFrom")) {
						dDateTo = this.getCompModel("FormsFilterModel").getProperty("/dateTo");
						dDateFrom = new Date(dDateTo.getTime());
						dDateFrom.setMonth(dDateTo.getMonth() - 1);
						this.getCompModel("FormsFilterModel").setProperty("/dateFrom", dDateFrom);
					} else if (!this.getCompModel("FormsFilterModel").getProperty("/dateTo")) {
						dDateFrom = this.getCompModel("FormsFilterModel").getProperty("/dateFrom");
						dDateTo = new Date(dDateFrom.getTime());
						dDateTo.setMonth(dDateFrom.getMonth() + 1);
						this.getCompModel("FormsFilterModel").setProperty("/dateFrom", dDateFrom);
					}

					oDateFilter = new Filter({
						path: "LastChangedOn",
						operator: sap.ui.model.FilterOperator.BT,
						value1: this.getCompModel("FormsFilterModel").getProperty("/dateFrom"),
						value2: this.getCompModel("FormsFilterModel").getProperty("/dateTo")
					});
					aFilters.push(oDateFilter);

					if (this.getCompModel("FormsFilterModel").getProperty("/statusKeys")
					&& this.getCompModel("FormsFilterModel").getProperty("/statusKeys").length > 0) {
						var aStatusKeys = this.getCompModel("FormsFilterModel").getProperty("/statusKeys");
						var aStatusFilters = [];
						for (var i = 0; i < aStatusKeys.length; i++) {
							var sKey = aStatusKeys[i];
							var oStatusFilter = new Filter({
								path: "Status",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: sKey
							});
							aStatusFilters.push(oStatusFilter);
						}
						var oStatusFullFilter = new Filter({
							filters: aStatusFilters,
							and: false
						});
						aFilters.push(oStatusFullFilter);
					}
				}

				// MyApprovals filter
				var bMyApprovals = !bMyForms;
				var oMyApprovalsFiter = new Filter({
					path: "MyApprovals",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: bMyApprovals
				});
				var aMyApprovalsFilters = [oMyApprovalsFiter];
				var oMyApprovalsFullFilter = new Filter({
					filters: aMyApprovalsFilters,
					and: true
				});
				aFilters.push(oMyApprovalsFullFilter);

				//Add new filter: createdBy
				var sCreatedByUsername = this.getCompModel("user").oData.d.UserName,
				oCreatedByFilter = new Filter({
					path: "CreatedBy",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: sCreatedByUsername
				}),
				aCreatedByFilters = [oCreatedByFilter],
				oCreatedByFullFilter = new Filter({
					filters: aCreatedByFilters,
					and: true
				});
				aFilters.push(oCreatedByFullFilter);

				oFullFilter = new Filter({
					filters: aFilters,
					and: true
				});

				var mParams = {
					success: function(oData, result) {
						var aResults = oData.results;
						this.getCompModel("FormsModel").setSizeLimit((aResults.length + 1));
						this.getCompModel("FormsModel").setProperty("/forms", aResults);
						this.getCompModel("FormsModel").setProperty("/formsTotal", aResults.length);
						return resolve();
					}.bind(this),
					error: function(oError) {
						return reject(oError);
					}.bind(this),
					filters: [oFullFilter]
				};

				this.getCompModel().read("FARAFormSet", mParams);
			}.bind(this));
		},

		/**
		 * Loads Form Status list
		 * @private
		 */
		_loadFormsStatus: function() {
			return new Promise(function(resolve, reject) {
				if (this.getCompModel("FormsStatus") &&
					(!this.getCompModel("FormsStatus").getProperty("/formsStatus") || this.getCompModel("FormsStatus").getProperty("/formsStatus").length === 0)) {
					var mParams = {
						success: function(oData, result) {
							var aResults = oData.results;

							aResults.unshift({
								Status: this.getConstant("selectAllKey"),
								StatusDescription: this.getResourceBundleText("selectAll")
							});

							this.getCompModel("FormsStatus").setSizeLimit((aResults.length));
							this.getCompModel("FormsStatus").setProperty("/formsStatus", aResults);
							return resolve();
						}.bind(this),
						error: function(oError) {
							return reject(oError);
						}.bind(this)
					};

					this.getCompModel().read("FormStatusSet", mParams);
				} else {
					return resolve();
				}
			}.bind(this));
		},

		/**
		 * Selects form from URL param
		 * @private
		 */
		_selectForm: function(sFormId) {
			var oList = this.byId("formsList");
			var aForms = oList.getItems();
			var oItem = aForms.find(function(oItem) {
				return oItem.getBindingContext("FormsModel").getProperty("FormID") === sFormId;
			});
			oList.setSelectedItem(oItem);
		},

		/**
		 * Deselects every selected form.
		 * For creation uses, so in creation, no form should be selected.
		 * @private
		 */
		_deselectForm: function() {
			var oList = this.byId("formsList");
			var aForms = oList.getItems();
			aForms.forEach(function(oItem) {
				oList.setSelectedItem(oItem, false);
			});
		},

		/**
		 * Private variables for controling if a form is opened and from where
		 * @private
		 */
		_formOpenAndCreation: function(bFormOpen, bCreateFaraForm) {
			this._formOpen = bFormOpen;
			this._createFaraForm = bCreateFaraForm;
		},

		/**
		 * Reload forms after Creating or Updating a form from event bus, falling _reloadFormsAfterCreateUpdate method.
		 * @private
		 */
		_reloadForms: function(sChannel, sMethod, oParams) {
			var sId = oParams.id;
			this._reloadFormsAfterCreateUpdate(sId, function() {
				var sUrl = this.getCompModel("FaraFormProperties").getProperty("/myForms") ? "FaraForm" : "FaraFormApprove";
				this.navTo(sUrl, {
					id: sId
				});
			}.bind(this));
		},

		/**
		 * Load forms list and after that, executes a funtion received by parameter.
		 * Also, selects and load a form.
		 * @private
		 * @param  {string} sId Id of the form to select and load
		 * @param  {function} fThen Function to execute when forms are loaded
		 */
		_reloadFormsAfterCreateUpdate: function(sId, fThen) {
			this.switchOnBusy();

			this._loadFormsStatus()
				.then(function() {
					this._loadForms()
						.then(function() {
							this._sortForms();
							this._selectForm(sId);
							fThen();
							this.switchOffBusy();
						}.bind(this))
						.catch(function(oError) {
							this.alert(
								"faraForm.models.formsList",
								"E",
								function() {
									this.switchOffBusy();
								}.bind(this), [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]
							);
						}.bind(this));
				}.bind(this))
				.catch(function(oError) {
					this.alert(
						"faraForm.models.formsStatusList",
						"E",
						function() {
							this.switchOffBusy();
						}.bind(this), [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]
					);
				}.bind(this));

		}

	});

});
