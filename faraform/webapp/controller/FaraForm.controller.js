sap.ui.define([

    "news/uk/fara/controller/BaseController",

    "sap/ui/model/json/JSONModel",

    "sap/ui/model/Filter",

    "sap/m/Token"

], function(BaseController, JSONModel, Filter, Token) {

    "use strict";



    return BaseController.extend("news.uk.fara.controller.FaraForm", {



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

                oRouteMainApp = oRouter.getRoute("CreateFaraForm"),

                oRouteFaraForm = oRouter.getRoute("FaraForm"),

                oRouteFaraFormApprove = oRouter.getRoute("FaraFormApprove");

            oRouteMainApp.attachMatched(this.onRouteMatchedCreateFaraForm, this);

            oRouteFaraForm.attachMatched(this.onRouteMatchedFaraForm, this);
            oRouteFaraFormApprove.attachMatched(this.onRouteMatchedFaraFormApprove, this);


            oRouter.attachRouteMatched(this.onRouteMatched, this);
              
            //Event to clean every option selected and every wtitten input field in the form

            this.getEventBus().subscribe("FaraForm", "Reload", this._reloadForm, this);

            //Event to reload the models and load a selected form data

            this.getEventBus().subscribe("FaraForm", "LoadForm", this._loadModelsAndForm, this);

            //Event to get workItemId value

            this.getEventBus().subscribe("FaraForm", "GetWorkItemID", this._getWorkItemId, this);

        },



		/* =========================================================== */

		/* event handlers                                              */

		/* =========================================================== */


        onRouteMatched: function(oEvent) {
            var oParameters = oEvent.getParameters(),
                sRouteName = oParameters.name;
            this.getModel("CurrentUrlModel").setProperty("/route", sRouteName);

        },
            
        /**

         * Initialize model & retrieve information to the screen.

         * Important Note: Matched only to "CreateFaraForm" route

         * @public

         * @param  {sap.ui.base.Event} oEvent Route match event

         */

        onRouteMatchedCreateFaraForm: function(oEvent) {

            this.getModel("CurrentUrlModel").setProperty("/currentURL", "CreateFaraForm");



            this._sFormId = undefined;

            this._bUserChecked = false;   // Has the user checked the form?
            this._initModels();



            // Special reset for publications radio group, to finish implementing right when we know how to do correct publications assignment

            var oPublications = this.byId("PublicationsRadioButtonGroup");

            if (oPublications != undefined) {
                var aPublicationsButtons = oPublications.getButtons();

                for(var i = 0; i < aPublicationsButtons.length; i++){

                    aPublicationsButtons[i].setSelected(false);

                }

            }
        

            this.getCompModel("FaraFormProperties").setProperty("/canEdit", true);

            this.getCompModel("FaraFormProperties").setProperty("/cancelVisible", true);

            this.getCompModel("FaraFormProperties").setProperty("/creation", true);

            this.getCompModel("FaraFormProperties").setProperty("/resubmission", false);

        },



        /**

         * Initialize model & retrieve information to the screen.

         * Important Note: Matched only to "FaraForm" route

         * @public

         * @param  {sap.ui.base.Event} oEvent Route match event

         */

        onRouteMatchedFaraForm: function(oEvent) {

            // this.getEventBus().subscribe("FaraForm", "LoadForm", this._loadModelsAndForm, this);

            if(!this.getCompModel("user") || !this.getCompModel("user").oData.d.UserName){

              this.getModel("CurrentUrlModel").setProperty("/currentURL", "FaraForm");

              this.getModel("CurrentUrlModel").setProperty("/id", oEvent.getParameter("arguments").id);

         //     this.navTo("Login");

            }

            this.getCompModel("FaraFormProperties").setProperty("/creation", false);

            this.getCompModel("FaraFormProperties").setProperty("/resubmission", false);

        },



        /**

         * Initialize model & retrieve information to the screen.

         * Important Note: Matched only to "FaraFormApprove" route

         * @public

         * @param  {sap.ui.base.Event} oEvent Route match event

         */

        onRouteMatchedFaraFormApprove: function(oEvent) {

            // this.getEventBus().subscribe("FaraForm", "LoadForm", this._loadModelsAndForm, this);

            if(!this.getCompModel("user") || !this.getCompModel("user").oData.d.UserName){

              this.getModel("CurrentUrlModel").setProperty("/currentURL", "FaraFormApprove");

              this.getModel("CurrentUrlModel").setProperty("/id", oEvent.getParameter("arguments").id);

            //  this.navTo("Login");

            }

            this.getCompModel("FaraFormProperties").setProperty("/creation", false);

            this.getCompModel("FaraFormProperties").setProperty("/resubmission", false);

        },



        /**

         * ASL radio button selected.
         *
         * @public

         * @param  {sap.ui.base.Event} oEvent Select event

         */

        onApprovedSignatureSelect: function(oEvent){

            if(oEvent.getParameter("selected")){

                        this._resetWhoRequiresAccessSelection();

                        this._loadYourDetails();

                        this._resetRequireAccess();

           
                /**
                const bYourselfSelected = this.getCompModel("FaraFormModel").getProperty("/whoRequiresForm/yourselfSelected");
                const bSomeoneElseSelected = this.getCompModel("FaraFormModel").getProperty("/whoRequiresForm/someoneElseSelected");
                       
                let hasASL = false;
                let aslLevel;
                        if (bYourselfSelected) {
                          hasASL = this.getCompModel("CurrentUserModel").getProperty("/HasASL");
                          aslLevel = this.getCompModel("CurrentUserModel").getProperty("/ASLLevel");

                } else if (bSomeoneElseSelected) {
                  hasASL = this.getCompModel("FaraFormModel").getProperty("/creatingAccess/hasASL");
                  aslLevel = this.getCompModel("FaraFormModel").getProperty("/creatingAccess/aslLevel");
                        }

                        // Cost centre not mandatory if user currently on the ASL
                        if (hasASL) {
                    let oCostCentresText = this.byId("costCentresText");
                            oCostCentresText.removeStyleClass("requiredText");
                        }

                        // Default to the user's ASL level
                if (bYourselfSelected || bSomeoneElseSelected) {
                        this.getCompModel("FaraFormModel").setProperty("/aslAuth/levelSelected", aslLevel);

                }
                **/


                        // Clear Yes and No radio buttons
                        this.getCompModel("FaraFormModel").setProperty("/otherFinancialSystems/yesSelected", false);

                        this.getCompModel("FaraFormModel").setProperty("/otherFinancialSystems/noSelected", false);

                        this._resetOtherFinancialSystemsSubsections(true);



                this.getCompModel("FaraFormModel").setProperty("/aslAuth/canSelectCostCenterOtherDept", false);

                        this.getCompModel("FaraFormModel").setProperty("/aslAuth/costCenterOtherDeptYesSelected", false);

                        this.getCompModel("FaraFormModel").setProperty("/aslAuth/costCenterOtherDeptNoSelected", false);

                this.getCompModel("FaraFormModel").setProperty("/aslAuth/canApproveDept", false);

                        this.getCompModel("FaraFormModel").setProperty("/aslAuth/approveDeptYesSelected", false);

                        this.getCompModel("FaraFormModel").setProperty("/aslAuth/approveDeptNoSelected", false);


                        this.getCompModel("FaraFormProperties").setProperty("/typeAccess", false);

                        this.getCompModel("FaraFormModel").setProperty("/typeAccess/yesSelected", false);

                        this.getCompModel("FaraFormModel").setProperty("/typeAccess/noSelected", false);

                        this._resetTypeAccessNoSelectedAndRelated(true);

                


            }

        },



        /**

         * Radio button ASL selected on which area is this request for section

         * @public

         * @param  {sap.ui.base.Event} oEvent Select event

         */

        onSAPSelect: function(oEvent){

            if(oEvent.getParameter("selected")){

                this._resetTypeOfAccessSection();

                this._resetASLAuth();

                this._resetCostCentresOtherDept();
                this._resetCostCentreDepts();


                // Yes and No radio buttons from Other Financial Systems

                this.getCompModel("FaraFormModel").setProperty("/otherFinancialSystems/yesSelected", false);

                this.getCompModel("FaraFormModel").setProperty("/otherFinancialSystems/noSelected", false);

                this._resetOtherFinancialSystemsSubsections(true);



                this.getCompModel("FaraFormProperties").setProperty("/typeAccess", false);

                this.getCompModel("FaraFormModel").setProperty("/typeAccess/yesSelected", false);

                this.getCompModel("FaraFormModel").setProperty("/typeAccess/noSelected", false);

                this._resetTypeAccessNoSelectedAndRelated(true);

            }

        },



        /**

         * Searchs Account to copy

         * Second version, where the search button makes the second step

         * @public

         * @param  {sap.ui.base.Event} oEvent Search event

         */

        onSearchAccountToCopy: function(oEvent){

            var fCleanData;

            if(oEvent.getParameter("suggestionItem")){

                var fSuccess = function(oData, result){

                    this.getCompModel("FaraFormModel").setProperty("/typeAccess/userId", oData.UserName);

                    this.getCompModel("FaraFormModel").setProperty("/typeAccess/jobTitle", oData.JobTitle);

                    this.getCompModel("FaraFormModel").setProperty("/typeAccess/department", oData.Department);

                    this.getCompModel("FaraFormModel").setProperty("/typeAccess/manager", oData.ManagerFullName);



                    this.getCompModel("FaraFormProperties").setProperty("/typeOfAccessSearchedValuesVisible", true);

                    // this.getCompModel("FaraFormProperties").setProperty("/submitVisible", true);



                    var aRoles = oData.Roles.results;

                    var sUserRoles = "";



                    if(aRoles && aRoles.length > 0){

                        aRoles.forEach(function(oRole){

                            if(sUserRoles){

                                sUserRoles += ",";

                            }



                            sUserRoles += oRole.RoleName;

                        }.bind(this));

                    }



                    this.getCompModel("FaraFormModel").setProperty("/typeAccess/roles", sUserRoles);

                    this._checkSubmit();



                    this.switchOffBusy();

                };



                this._loadSelectedUser(oEvent.getParameter("suggestionItem").getKey(), fSuccess, true);

            } else if(oEvent.getParameter("query")) {

                fCleanData = function(){

                    this.getCompModel("FaraFormModel").setProperty("/typeAccess/jobTitle", "");

                    this.getCompModel("FaraFormModel").setProperty("/typeAccess/department", "");

                    this.getCompModel("FaraFormModel").setProperty("/typeAccess/manager", "");



                    this.getCompModel("FaraFormProperties").setProperty("/typeOfAccessSearchedValuesVisible", false);

                    // this.getCompModel("FaraFormProperties").setProperty("/submitVisible", false);

                    this._checkSubmit();



                    this.switchOffBusy();

                }.bind(this);



                var fSuccessUserSet = function(oData, result){

                    this.getCompModel("FaraFormModel").setProperty("/typeAccess/userId", oData.UserName);

                    this.getCompModel("FaraFormModel").setProperty("/typeAccess/searchAccountToCopy", oData.FullName);

                    this.getCompModel("FaraFormModel").setProperty("/typeAccess/jobTitle", oData.JobTitle);

                    this.getCompModel("FaraFormModel").setProperty("/typeAccess/department", oData.Department);

                    this.getCompModel("FaraFormModel").setProperty("/typeAccess/manager", oData.ManagerFullName);



                    this.getCompModel("FaraFormProperties").setProperty("/typeOfAccessSearchedValuesVisible", true);

                    // this.getCompModel("FaraFormProperties").setProperty("/submitVisible", true);



                    var aRoles = oData.Roles.results;

                    var sUserRoles = "";



                    if(aRoles && aRoles.length > 0){

                        aRoles.forEach(function(oRole){

                            if(sUserRoles){

                                sUserRoles += ",";

                            }



                            sUserRoles += oRole.RoleName;

                        }.bind(this));

                    }



                    this.getCompModel("FaraFormModel").setProperty("/typeAccess/roles", sUserRoles);

                    this._checkSubmit();



                    this.switchOffBusy();

                };



                this._searchAndLoad(oEvent.getParameter("query"), fCleanData, fSuccessUserSet, true);

            } else if(!oEvent.getParameter("clearButtonPressed")) {

                fCleanData = function(){

                    this._resetTypeAccessSearchedData();

                }.bind(this);

                this.alert("faraForm.typeAccess.warningInputAccount", "W", fCleanData);

            } else {

                this._resetTypeAccessSearchedData();

            }

        },



        /**

         * Searchs Name for create access

         * Second version, where the search button makes the second step

         * @public

         * @param  {sap.ui.base.Event} oEvent Search event

         */

        onSearchNameCreatingAccess: function(oEvent){

            var fCleanData;

            if(oEvent.getParameter("suggestionItem")){

                var fSuccess = function(oData, result){

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/userId", oData.UserName);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/jobTitle", oData.JobTitle);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/department", oData.Department);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/homeCostCenter", oData.CostCenter);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/homeCostCenterName", oData.CostCenterName);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/manager", oData.ManagerFullName);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/phone", oData.Phone);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/mail", oData.Email);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/hasASL", oData.HasASL);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/aslLevel", oData.ASLLevel);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/hasSignature", oData.HasSignature);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/aslCostCenters", oData.ASLCostCenter);
                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/aslCanSelectCostCenterOtherDept", oData.CanSelectOtherDept);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/aslCostCentersOtherDept", oData.ASLCostCenterOtherDept);
                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/aslCanApproveDept", oData.CanApproveDept);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/aslDepts", oData.ASLDept);


                    this.getCompModel("FaraFormProperties").setProperty("/creatingAccessDataVisible", true);

                    this.getCompModel("FaraFormModel").setProperty("/aslAuth/canSelectCostCenterOtherDept", oData.CanSelectOtherDept);

                    this.getCompModel("FaraFormModel").setProperty("/aslAuth/canApproveDept", oData.CanApproveDept);


                    this.getCompModel("FaraFormModel").setProperty("/aslAuth/costCentersKeys", (oData.ASLCostCenter || "").split(","));
                    this.getCompModel("FaraFormModel").setProperty("/aslAuth/costCentersOtherDeptKeys", (oData.ASLCostCenterOtherDept || "").split(","));
                    this.getCompModel("FaraFormModel").setProperty("/aslAuth/costCenterDeptsKeys", (oData.ASLDepts || "").split(","));
                  
                    this._checkSubmit();



                    var bAddNewTransaction = this.getCompModel("FaraFormModel").getProperty("/typeAccess/addNewTransactionSelected");

                    var bAddNewRole = this.getCompModel("FaraFormModel").getProperty("/typeAccess/addNewRoleSelected");


                    // Refresh cost centers, using the selected user
                    this._loadCostCenters(oData.UserName);


                    this._loadCostCentersOtherDepartment(oData.UserName)
                      .then(this._loadCostCenterDepartments(oData.UserName)
                      .then(function(){ })
                    );

                    if(bAddNewTransaction || bAddNewRole) {

                      this._initExistingRolesModel(oData.UserName, bAddNewTransaction)

                        .then(function() {

                          this.switchOffBusy();

                        }.bind(this))

                        .catch(function() {

                          this.switchOffBusy();

                        }.bind(this));

                    } else {

                      this.switchOffBusy();

                    }


                    // Default to the user's ASL level and cost centres
                    if (this.getCompModel("FaraFormModel").getProperty("/areaRequestForm/approvedSignatureSelected")) {
                      var oCostCentresText = this.byId("costCentresText");
                      this.getCompModel("FaraFormModel").setProperty("/aslAuth/levelSelected", oData.ASLLevel);

                      if (oData.HasASL) {
                        oCostCentresText.removeStyleClass("requiredText");
                      } else {
                        oCostCentresText.addStyleClass("requiredText");
                      }
                    }

                };



                this._loadSelectedUser(oEvent.getParameter("suggestionItem").getKey(), fSuccess);

            } else if(oEvent.getParameter("query")) {



                fCleanData = function(){

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/jobTitle", "");

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/department", "");

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/homeCostCenter", "");

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/homeCostCenterName", "");

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/manager", "");

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/phone", "");

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/mail", "");

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/hasASL", false);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/aslLevel", "");

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/hasSignature", false);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/aslCostCenters", "");
                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/canSelectCostCenterOtherDept", false);
                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/aslCostCentersOtherDept", "");
                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/canApproveDept", false);
                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/aslDepts", "");

                    this.getCompModel("FaraFormProperties").setProperty("/creatingAccessDataVisible", false);

                    this._resetCostCentresOtherDept();
                    this._resetCostCentreDepts();


                    this._checkSubmit();



                    this.switchOffBusy();

                }.bind(this);



                var fSuccessUserSet = function(oData, result){

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/userId", oData.UserName);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/name", oData.FullName);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/jobTitle", oData.JobTitle);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/department", oData.Department);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/homeCostCenter", oData.CostCenter);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/homeCostCenterName", oData.CostCenterName);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/manager", oData.ManagerFullName);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/phone", oData.Phone);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/mail", oData.Email);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/hasASL", oData.HasASL);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/aslLevel", oData.ASLLevel);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/hasSignature", oData.HasSignature);

                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/aslCostCenters", oData.ASLCostCenter);
                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/aslCanSelectCostCenterOtherDept", oData.CanSelectOtherDept);
                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/aslCostCentersOtherDept", oData.ASLCostCenterOtherDept);
                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/aslCanApproveDept", oData.CanApproveDept);
                    this.getCompModel("FaraFormModel").setProperty("/creatingAccess/aslDepts", oData.ASLDept);

                    this.getCompModel("FaraFormProperties").setProperty("/creatingAccessDataVisible", true);

                    this.getCompModel("FaraFormModel").setProperty("/aslAuth/canSelectCostCenterOtherDept", oData.CanSelectOtherDept);

                    this.getCompModel("FaraFormModel").setProperty("/aslAuth/canApproveDept", oData.CanApproveDept);


                    this._checkSubmit();



                    // Refresh cost centers, using the selected user
                    this._loadCostCenters(oData.UserName);


                    this._loadCostCentersOtherDepartment(oData.UserName)
                      .then(this._loadCostCenterDepartments(oData.UserName)
                      .then(function(){ })
                    );

                    this.switchOffBusy();


                    // Default to the user's ASL level and cost centres
                    if (this.getCompModel("FaraFormModel").getProperty("/areaRequestForm/approvedSignatureSelected")) {
                      var oCostCentresText = this.byId("costCentresText");
                      this.getCompModel("FaraFormModel").setProperty("/aslAuth/levelSelected", oData.ASLLevel);

                      this.getCompModel("FaraFormModel").setProperty("/aslAuth/costCentersKeys", (oData.ASLCostCenter || "").split(","));
                      this.getCompModel("FaraFormModel").setProperty("/aslAuth/costCentersOtherDeptKeys", (oData.ASLCostCenterOtherDept || "").split(","));

                      if (oData.HasASL) {
                        oCostCentresText.removeStyleClass("requiredText");
                      } else {
                        oCostCentresText.addStyleClass("requiredText");
                      }
                    }

                };



                this._searchAndLoad(oEvent.getParameter("query"), fCleanData, fSuccessUserSet, false);

            } else if(!oEvent.getParameter("clearButtonPressed")) {

                fCleanData = function(){

                    this._resetCreatingAccessDetails();

                    this._resetCostCentresOtherDept(true);
                    this._resetCostCentreDepts(true);
                    this._resetASLAuth();
                    this._checkSubmit();

                }.bind(this);

                this.alert("faraForm.creatingAccess.warningAccountName", "W", fCleanData);

            } else {

                this._resetCreatingAccessDetails();

                this._resetCostCentresOtherDept(true);
                this._resetCostCentreDepts(true);
                this._resetASLAuth();
                this._checkSubmit();

            }

        },



        /**

         * Shows type of access required

         * @public

         * @param  {sap.ui.base.Event} oEvent Search event

         */

        onNext: function(oEvent){

            this.getCompModel("FaraFormProperties").setProperty("/typeAccess", true);

        },



        /**

         * Radio button Yourself selected for who requires access

         *
         * @public

         * @param  {sap.ui.base.Event} oEvent Select event

         */

        onYourselfSelect: function(oEvent){

            if(oEvent.getParameter("selected")){

                this._loadCostCenters(this.getCompModel("CurrentUserModel").getProperty("/UserName"))

                    .then(function() {
                this._loadYourDetails();

                        this._resetRequireAccess();

                        this._resetCostCentresOtherDept();
                        this._resetCostCentreDepts();
                this.getCompModel("FaraFormModel").setProperty("/typeAccess/yesSelected", false);

                this.getCompModel("FaraFormModel").setProperty("/typeAccess/noSelected", false);

                this.getCompModel("FaraFormModel").setProperty("/typeAccess/addNewTransactionSelected", false);

                this.getCompModel("FaraFormModel").setProperty("/typeAccess/addNewRoleSelected", false);


                this._resetSomeoneElseDetails();


                let bYourselfSelected = this.getCompModel("FaraFormModel").getProperty("/whoRequiresForm/yourselfSelected");
                        let hasASL, aslLevel, aslCostCenters, aslCostCentersOtherDept, canSelectCostCenterOtherDept, canApproveDept;
                if (bYourselfSelected) {
                  hasASL = this.getCompModel("CurrentUserModel").getProperty("/HasASL");
                  aslLevel = this.getCompModel("CurrentUserModel").getProperty("/ASLLevel");

                  aslCostCenters = this.getCompModel("CurrentUserModel").getProperty("/ASLCostCenters") || "";
                  aslCostCentersOtherDept = this.getCompModel("CurrentUserModel").getProperty("/ASLCostCentersOtherDept") || "";
                          canSelectCostCenterOtherDept = this.getCompModel("CurrentUserModel").getProperty("/ASLCanSelectCostCenterOtherDept") || false;
                          canApproveDept = this.getCompModel("CurrentUserModel").getProperty("/ASLCanApproveDept") || false;
                } else {
                  hasASL = this.getCompModel("FaraFormModel").getProperty("/creatingAccess/hasASL")
                  aslLevel = this.getCompModel("FaraFormModel").getProperty("/creatingAccess/aslLevel")
                  aslCostCenters = this.getCompModel("FaraFormModel").getProperty("/creatingAccess/aslCostCenters") || "";
                  aslCostCentersOtherDept = this.getCompModel("FaraFormModel").getProperty("/creatingAccess/aslCostCentersOtherDept") || "";
                          canSelectCostCenterOtherDept = this.getCompModel("FaraFormModel").getProperty("/creatingAccess/canSelectCostCenterOtherDept") || false;
                          canApproveDept = this.getCompModel("FaraFormModel").getProperty("/creatingAccess/canApproveDept") || false;
                }

                // Cost centre not mandatory if user currently on the ASL
                        let oCostCentresText = this.byId("costCentresText");
                if (hasASL) {
                  oCostCentresText.removeStyleClass("requiredText");
                } else {
                  oCostCentresText.addStyleClass("requiredText");
                } 

                // Default to the user's ASL level and cost centres
                this.getCompModel("FaraFormModel").setProperty("/aslAuth/levelSelected", aslLevel);

                this.getCompModel("FaraFormModel").setProperty("/aslAuth/costCentersKeys", aslCostCenters.split(","));
                this.getCompModel("FaraFormModel").setProperty("/aslAuth/costCentersOtherDeptKeys", aslCostCentersOtherDept.split(","));
                        this.getCompModel("FaraFormModel").setProperty("/aslAuth/canSelectCostCenterOtherDept", canSelectCostCenterOtherDept);

                        this.getCompModel("FaraFormModel").setProperty("/aslAuth/canApproveDept", canApproveDept);

                        this._resetCreatingAccessDetails(false);


                        this._loadCostCentersOtherDepartment(this.getCompModel("CurrentUserModel").getProperty("/UserName"))
                          .then(this._loadCostCenterDepartments(this.getCompModel("CurrentUserModel").getProperty("/UserName"))
                          .then(function(){ })
                        );

                    }.bind(this));
            }

        },



        /**

         * Radio button Someone else selected on who requires access section

         * @public

         * @param  {sap.ui.base.Event} oEvent Select event

         */

        onSomeoneElseSelect: function(oEvent){

            if(oEvent.getParameter("selected")){

                this._resetRequireAccess();

                this._resetYourDetails();

                this._resetTypeAccessNoSelectedAndRelated();

                this._resetCostCentresOtherDept();
                this._resetCostCentreDepts();


                // Yes and No radio buttons from Other Financial Systems

                this.getCompModel("FaraFormModel").setProperty("/otherFinancialSystems/yesSelected", false);

                this.getCompModel("FaraFormModel").setProperty("/otherFinancialSystems/noSelected", false);

                this._resetOtherFinancialSystemsSubsections(true);



                this.getCompModel("FaraFormProperties").setProperty("/typeAccess", false);

                this.getCompModel("FaraFormModel").setProperty("/typeAccess/yesSelected", false);

                this.getCompModel("FaraFormModel").setProperty("/typeAccess/noSelected", false);

                this.getCompModel("FaraFormModel").setProperty("/typeAccess/addNewTransactionSelected", false);

                this.getCompModel("FaraFormModel").setProperty("/typeAccess/addNewRoleSelected", false);


                this.getCompModel("FaraFormModel").setProperty("/aslAuth/levelSelected", "");
                this.getCompModel("FaraFormModel").setProperty("/aslAuth/costCentersKeys", "");
                this.getCompModel("FaraFormModel").setProperty("/aslAuth/costCentersOtherDeptKeys", "");
                this.getCompModel("FaraFormModel").setProperty("/aslAuth/costCenterDeptsKeys", "");
              
                this.getCompModel("CostCentersModel").setProperty("/costCenters", []);
                this.getCompModel("CostCentersOtherDeptModel").setProperty("/costCenters", []);
                this.getCompModel("CostCenterDeptsModel").setProperty("/departments", []);

                this.getCompModel("FaraFormProperties").setProperty("/creatingAccessDataVisible", false);

                this._resetSomeoneElseDetails(false);

            }

        },



        /**

         * Radio button yes selected for copy someone access profile

         * @public

         * @param  {sap.ui.base.Event} oEvent Select event

         */

        onCopyYesSelect: function(oEvent){

            if(oEvent.getParameter("selected")){

                this._resetTypeAccessSearchedData();

                this.getCompModel("FaraFormModel").setProperty("/typeAccess/searchAccountToCopy", "");

                this.getCompModel("FaraFormModel").setProperty("/typeAccess/magnifier", true);

                this._resetTypeAccessNoSelectedAndRelated();

                this._resetOtherFinancialSystemsSubsections(true);

                this._checkSubmit();

            }

        },



        /**

         * Radio button no selected for copy someone access profile

         * @public

         * @param  {sap.ui.base.Event} oEvent Select event

         */

        onCopyNoSelect: function(oEvent){

            this._checkSubmit();

        },



        /**

         * Radio button yes selected in access to other financial systems

         * @public

         * @param  {sap.ui.base.Event} oEvent Select event

         */

        onOtherFinancialSystemsYesSelect: function(oEvent){

            if(!oEvent.getParameter("selected")){

                this._loadCostCenters(this.getCompModel("CurrentUserModel").getProperty("/UserName"))

                    .then(function(){

                        this._resetOtherFinancialSystemsSubsections();

                    }.bind(this))

                    .catch(function() {



                    }.bind(this));

            }

            this._checkSubmit();

        },



        /**

         * Radio button no selected in access to other finantial systems

         * @public

         * @param  {sap.ui.base.Event} oEvent Select event

         */

        onOtherFinancialSystemsNoSelect: function(oEvent){

            if(oEvent.getParameter("selected")){

                this._resetOtherFinancialSystemsSubsections();

                this._checkSubmit();

            }

        },



        /**

         * Radio button yes selected in require access

         * @public

         * @param  {sap.ui.base.Event} oEvent Select event

         */

        onRequireAccessYesSelect: function(oEvent){

            this._checkSubmit();

        },



        /**

         * Radio button no selected in require access

         * @public

         * @param  {sap.ui.base.Event} oEvent Select event

         */

        onRequireAccessNoSelect: function(oEvent){

            if(oEvent.getParameter("selected")){

                this.getCompModel("FaraFormModel").setProperty("/typeAccess/yesSelected", false);

                this.getCompModel("FaraFormModel").setProperty("/typeAccess/noSelected", false);

                this.getCompModel("FaraFormModel").setProperty("/typeAccess/addNewTransactionSelected", false);

                this.getCompModel("FaraFormModel").setProperty("/typeAccess/addNewRoleSelected", false);



                this._checkSubmit();

            }

        },



        /**

         * Radio button approver selected in Expences section.

         * It can't be checked if it's not an ASL.

         * @public

         * @param  {sap.ui.base.Event} oEvent Select event

         */

        onExpencesApproverSelect: function(oEvent){

            if(!this.getCompModel("FaraFormModel").getProperty("/areaRequestForm/approvedSignatureSelected")){

                var fCleanApprover = function(){

                    this.getCompModel("FaraFormModel").setProperty("/expences/approverSelected", false);

                }.bind(this);

                this.alert("faraForm.expences.approverNotASLWarning", "W", fCleanApprover);

            }

        },



        /**

         * Radio button Add New Transaction selected in Type Access section.

         * @public

         * @param  {sap.ui.base.Event} oEvent Select event

         */

        onAddNewTransactionSelect: function(oEvent){

            if(oEvent.getParameter("selected")){

                this._loadCostCenters(this.getCompModel("CurrentUserModel").getProperty("/UserName"))

                    .then(function(){

                        this._resetAddNewTransaction();

                        this._checkSubmit();

                        var sUserId = null;

                        if(this.getModel("FaraFormModel").getProperty("/creatingAccess/userId")) {

                          sUserId = this.getModel("FaraFormModel").getProperty("/creatingAccess/userId");

                        } else {

                          sUserId = this.getCompModel("CurrentUserModel").getProperty("/UserName");

                        }



                        this.switchOnBusy();

                        this._initExistingRolesModel(sUserId, true)

                          .then(function() {

                            this.switchOffBusy();

                          }.bind(this))

                          .catch(function() {

                            this.switchOffBusy();

                          }.bind(this));

                    }.bind(this))

                    .catch(function() {



                    }.bind(this));

            }

        },



        /**

         * Radio button Add New Role selected in Type Access section.

         * @public

         * @param  {sap.ui.base.Event} oEvent Select event

         */

        onAddNewRoleSelect: function(oEvent){

            this._resetAddNewRole();

            this._checkSubmit();

            if(oEvent.getParameter("selected")){

              var sUserId = null;

              if(this.getModel("FaraFormModel").getProperty("/creatingAccess/userId")) {

                sUserId = this.getModel("FaraFormModel").getProperty("/creatingAccess/userId");

              } else {

                sUserId = this.getCompModel("CurrentUserModel").getProperty("/UserName");

              }



              this.switchOnBusy();

                this._initExistingRolesModel(sUserId, false)

                .then(function() {

                  this.switchOffBusy();

                }.bind(this))

                .catch(function() {

                  this.switchOffBusy();

                }.bind(this));

            }

        },


        /**
         *
         * @public

         * @param  {sap.ui.base.Event} oEvent Select event

         * */
        onCostCenterOtherDeptYesSelected: function(oEvent) {

        },
      

        /**

         * Checkbox yes checked or unchecked in Invoices Coding Group section.

         * @public

         * @param  {sap.ui.base.Event} oEvent Select event

         */

        onInvoicesCodingGroupYes: function(oEvent){

            if(!oEvent.getParameter("selected")){

                this._resetInvoiceCodingGroup(false);

            }

        },



        /**

         * Checkbox yes checked or unchecked in Expences section.

         * @public

         * @param  {sap.ui.base.Event} oEvent Select event

         */

        onExpencesYes: function(oEvent){

            if(!oEvent.getParameter("selected")){

                this._resetExpences(false);

            }

        },



        /**

         * Checkbox yes checked or unchecked in SRM section.

         * @public

         * @param  {sap.ui.base.Event} oEvent Select event

         */

        onSRMYes: function(oEvent){

            if(!oEvent.getParameter("selected")){

                this._resetSRM(false);

            }

        },



        /**

         * Checkbox yes checked or unchecked in Stock Approval section.

         * @public

         * @param  {sap.ui.base.Event} oEvent Select event

         */

        onStockApprovalYes: function(oEvent){

            if(!oEvent.getParameter("selected")){

                this._resetStockApproval(false);

            }

        },



        /**

         * Checkbox yes checked or unchecked in ECS section.

         * @public

         * @param  {sap.ui.base.Event} oEvent Select event

         */

        onECSYes: function(oEvent){

            if(!oEvent.getParameter("selected")){

                this._resetECS(false);

            }

        },



        /**

         * Checkbox yes checked or unchecked in CMS section.

         * @public

         * @param  {sap.ui.base.Event} oEvent Select event

         */

        onCMSYes: function(oEvent){

            if(!oEvent.getParameter("selected")){

                this._resetCMS(false);

            }

        },



        /**

         * Link pressed to show table in a popover.

         * @public

         * @param  {sap.ui.base.Event} oEvent Select event

         */

        onViewAuthorisationPress: function(oEvent){

            if(!this._oImagePopover){

                this._oImagePopover = sap.ui.xmlfragment("news.uk.fara.fragment.ImagePopover", this);

                this.getView().addDependent(this._oImagePopover);

            }



            this._oImagePopover.openBy(oEvent.getSource());

        },



        /**

         * Event for closing popover.

         * @public

         * @param  {sap.ui.base.Event} oEvent Select event

         */

        onCloseImagePopoverPress: function(oEvent){

            this._oImagePopover.close();

        },



        /**

         * Event when yes is selected on Will you need to approve invoices? option

         * @public

         * @param  {sap.ui.base.Event} oEvent Press event

         */

        onAslAuthYesSelected: function(oEvent){

            var oCodiingGroupsText = this.byId("codiingGroupsText");

            if(oEvent.getParameter("selected")){

                oCodiingGroupsText.addStyleClass("requiredText");

            } else {

                oCodiingGroupsText.removeStyleClass("requiredText");

// MJ                this.getCompModel("FaraFormModel").setProperty("/aslAuth/approverCodingGroupsKeys", []);

            }

            this._checkSubmit();

        },


        /**

         * Event when no is selected on Will you need to approve invoices? option

         * @public

         * @param  {sap.ui.base.Event} oEvent Press event

         */

        onAslAuthNoSelected: function(oEvent){

            var oCodiingGroupsText = this.byId("codiingGroupsText");

            if(oEvent.getParameter("selected")){

                oCodiingGroupsText.addStyleClass("requiredText");

            } else {

                oCodiingGroupsText.removeStyleClass("requiredText");

// MJ               this.getCompModel("FaraFormModel").setProperty("/aslAuth/approverCodingGroupsKeys", []);

            }

            this._checkSubmit();

        },



        /**

         * Event when yes is selected on Will you need to have coder role? option

         * @public

         * @param  {sap.ui.base.Event} oEvent Press event

         */

        onCoderYesSelected: function(oEvent){

            var oCodiingGroupsText = this.byId("codiingGroupsCoderText");

            if(oEvent.getParameter("selected")){

                oCodiingGroupsText.addStyleClass("requiredText");

            } else {

                oCodiingGroupsText.removeStyleClass("requiredText");

            }

        },



        /**

         * Event when a publication is selected

         * @public

         * @param  {sap.ui.base.Event} oEvent Press event

         */

        onPublicationSelected: function(oEvent){

            if(oEvent.getParameter("selected")){

                var oRadioButton = oEvent.getSource();

                var sPubId = oRadioButton.data("pubId");

                this._loadPublicationCostCenters(sPubId)

                    .then(function(){

                    }.bind(this))

                    .catch(function(){

                    }.bind(this));

            }

        },



        /**

         * Event when a department is selected

         * @public

         * @param  {sap.ui.base.Event} oEvent Press event

         */

        onDepartmentSelected: function(oEvent){

            var sDepartmentId;

            if(oEvent.getParameter("selectedItem")){

                sDepartmentId = oEvent.getParameter("selectedItem").getKey();

            } else {

                sDepartmentId = oEvent.getParameter("id");

            }



            this._loadDepartmentCostCenters(sDepartmentId)

                .then(function(){

                }.bind(this))

                .catch(function(){

                }.bind(this));

        },



        /**

         * Submit form

         * @public

         * @param  {sap.ui.base.Event} oEvent Press event

         */

        onSubmit: function(oEvent){

            var oMandatoryCheckResult = this._checkMandatory();

            if(!oMandatoryCheckResult.ok){

                this.alert(

                    oMandatoryCheckResult.errorMsg,

                    "E"

                );

            } else {

                var oForm = this.getCompModel("FaraFormModel").getData();



                //Load transactions from token list created on transactions multi input

                var sTransactions = "";

                var oTransactionsMultiInput = this.byId("transactionsMultiInput");

                var aTokens = oTransactionsMultiInput.getTokens();



                aTokens.forEach(function(oToken){

                    if(sTransactions){

                        sTransactions += ",";

                    }

                    sTransactions += oToken.getKey();

                }.bind(this));



                //Load roles from different options:

                //1. If there is an user to copy selected, get his/her roles

                //2. If there are transactions selected, get roles from new transactions

                //3. If neither of 1. or 2. goes on, gets roles from new role

                var sRoles = "";



                if(oForm.typeAccess.userId){

                    sRoles = oForm.typeAccess.roles;

                } else if (sTransactions) {

                    sRoles = oForm.newTransaction.rolesKeys.join(",");

                } else {

                    sRoles = oForm.newRole.rolesKeys.join(",");

                }



                var oPublications = this.byId("PublicationsRadioButtonGroup");

                if (oPublications != undefined) {
                    var oSelectedPublication = oPublications.getSelectedButton();

                    var sSelectedPublicationId = "";

                    if(oSelectedPublication.getSelected()){

                        sSelectedPublicationId = oSelectedPublication.data("pubId");

                    }

                }


                //Add created by as current user if no record exists

                if(!oForm.createdBy){

                    oForm.createdBy = this.getCompModel("user").oData.d.UserName;

                }

                if(this._sFormId){

                    oForm.LastChangedBy = this.getCompModel("user").oData.d.UserName;

                }



                //Remove select all key

                oForm.aslAuth.costCentersKeys = this._purgeSelectedAll(oForm.aslAuth.costCentersKeys);

                oForm.aslAuth.costCentersOtherDeptKeys = this._purgeSelectedAll(oForm.aslAuth.costCentersOtherDeptKeys);

                oForm.aslAuth.costCenterDeptsKeys = this._purgeSelectedAll(oForm.aslAuth.costCenterDeptsKeys);

                oForm.expences.costCentersKeys = this._purgeSelectedAll(oForm.expences.costCentersKeys);

                oForm.ecs.costCentersKeys = this._purgeSelectedAll(oForm.ecs.costCentersKeys);

                oForm.cms.costCentersKeys = this._purgeSelectedAll(oForm.cms.costCentersKeys);



                //Parses everything into the Entity Format

                var oSendForm = {

                    ASLCostCenters: oForm.aslAuth.costCentersKeys.join(","),

                    ASLCostCentersOtherDept: oForm.aslAuth.costCentersOtherDeptKeys.join(","),

                    ASLCostCenterDepartments: oForm.aslAuth.costCenterDeptsKeys.join(","),
                    ASLDeptApprovalReq: oForm.aslAuth.costCenterOtherDeptYesSelected ? "X" : "",

                    ASLOtherDeptCostCentersReq: oForm.aslAuth.approveDeptYesSelected ? "X": "",
                    ASLLevel: oForm.aslAuth.levelSelected,

                    CMSCostCentres: oForm.cms.costCentersKeys.join(","),

                    CMSDeskheadRoleReq:oForm.cms.deskHeadSelected ? "X" : "",

                    CMSManagingEditorRoleReq: oForm.cms.managingEditorSelected ? "X" : "",

                    CMSRegionalApprovRoleReq: oForm.cms.regionalApproverSelected ? "X" : "",

                    ECSCommissionEditorRoleReq: oForm.ecs.comissioningEditorSelected ? "X" : "",

                    ECSContribCoordinatRoleReq: oForm.ecs.contributionsCoordinatorSelected ? "X" : "",

                    ECSCostCentres: oForm.ecs.costCentersKeys.join(","),

                    ECSDeskAdminitratorRoleReq: oForm.ecs.deskAdministratorSelected ? "X" : "",

                    ECSDeskheadApproverRoleReq: oForm.ecs.deskHeadApproverSelected ? "X" : "",

                    ECSManagingEditorRoleReq: oForm.ecs.managingEditorSelected ? "X" : "",

                    ExpenseApproverRoleReq: oForm.expences.approverSelected ? "X" : "",

                    ExpenseValidatorRoleReq: oForm.expences.validatorSelected ? "X" : "",

                    FormID: this._sFormId,

                    FormType: oForm.areaRequestForm.approvedSignatureSelected ? "A" : oForm.areaRequestForm.sapSelected ? "S" : "",

                    InvoiceApproverReq: oForm.aslAuth.invoicesYesSelected ? "X" : "",

                    InvoiceApproverCodingGroups: oForm.aslAuth.approverCodingGroupsKeys.join(","),

                    // InvoiceCoderReq: oForm.aslAuth.coderYesSelected ? "X" : "",

                    InvoiceCoderReq: oForm.codingGroup.yesSelected ? "X" : "",

                    // InvoiceCoderCodingGroups: oForm.aslAuth.coderCodingGroupsKeys.join(","),

                    InvoiceCoderCodingGroups: oForm.codingGroup.coderCodingGroupsKeys.join(","),

                    PMMRPRoleReq: oForm.stockApproval.productionMRPSelected ? "X" : "",

                    PMPORoleReq: oForm.stockApproval.productionPucharseSelected ? "X" : "",

                    Phone: oForm.yourDetailsForm.phone || oForm.creatingAccess.phone || oForm.typeAccess.phone,

                    Roles: sRoles,

                    SRMApproverRoleReq: oForm.srm.approverSelected ? "X" : "",

                    SRMBuyerRoleReq: oForm.srm.buyerSelected ? "X" : "",

                    Transactions: sTransactions,

                    UserIdReqAccess: oForm.areaRequestForm.approvedSignatureSelected ? oForm.creatingAccess.userId : oForm.areaRequestForm.sapSelected ? oForm.creatingAccess.userId : "",

                    UserIdToCopy: oForm.typeAccess.userId,

                    ECSPublicationID: oForm.ecs.yesSelected ? sSelectedPublicationId : "",

                    CMSDepartmentID: oForm.cms.yesSelected ? oForm.cms.departmentSelected : "",

                    CreatedBy: oForm.createdBy,

                    CreatedOn: oForm.createdOn,

                    LastChangedBy: oForm.LastChangedBy

                };


								// Warning to check form is complete - only displayed once per form
								if (this._bUserChecked === undefined || this._bUserChecked !== true) {
									this.alert("faraForm.submissionWarning", "S");
									this._bUserChecked = true;
									return;
								}

                var bCreate;



                //On success for either create or update, there will be another call to submit the form

                var fSuccess = function(oData, result){

                    var sFormID;



                    if(bCreate){

                        sFormID = oData.FormID;

                    } else{

                        if(!oData){

                            sFormID = this._sFormId;

                        }

                    }



                    if(sFormID){

                        var mSubmitFormParams = {

                            urlParameters: {

                                "FormId" : sFormID,

                                "CurrentUser": this.getCompModel("user").oData.d.UserName

                            },

                            success: function(oData, result){

                                if(oData.SubmitForm.Success){

                                    var fReloadForm;



                                    if(bCreate){

                                        fReloadForm = function(){

                                            this.switchOffBusy();

                                            this.getEventBus().publish("FaraForm", "ReloadFormsAfterCreateUpdate", {id: sFormID});

                                        }.bind(this);



                                        this.alert("faraForm.submit.success.create", "S", fReloadForm, [sFormID]);

                                    } else {

                                        fReloadForm = function(){

                                            this.switchOffBusy();

                                            this.getEventBus().publish("FaraForm", "ReloadFormsAfterCreateUpdate", {id: sFormID});

                                            this._loadForm(sFormID);

                                        }.bind(this);



                                        this.alert("faraForm.submit.success.update", "S", fReloadForm, [sFormID]);

                                    }

                                } else {

                                    this.alert(

                                        "faraForm.submit.error.withId",

                                        "E",

                                        function(){this.switchOffBusy();}.bind(this),

                                        [sFormID]

                                    );

                                }

                            }.bind(this),

                            error: function(oError){

                                this.alert(

                                    "faraForm.submit.error.submitError",

                                    "E",

                                    function(){this.switchOffBusy();}.bind(this),

                                    [sFormID, oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]

                                );

                            }.bind(this)

                        };

                        this.getCompModel().callFunction("SubmitForm", mSubmitFormParams);

                    }

                };



                var fError = function(oError) {

                    var sText;



                    if(bCreate) {

                        sText = "faraForm.submit.error.createError";

                    } else {

                        sText = "faraForm.submit.error.updatingError";

                    }



                    this.alert(

                        sText,

                        "E",

                        function(){this.switchOffBusy();}.bind(this),

                        [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, JSON.parse(oError.response.body).error.message.value]

                    );

                };



                var mParams = {

                    success: fSuccess.bind(this),

                    error: fError.bind(this)

                };



                if(oSendForm.FormID) {

                    bCreate = false;

                    this.switchOnBusy();

                    this.getCompModel().update("FARAFormSet('" + this._sFormId + "')", oSendForm, mParams);

                    // this.getCompModel().update("FARAFormSet('" + this._sFormId "')", oSendForm, mParams);

                } else {

                    bCreate = true;

                    this.switchOnBusy();

                    this.getCompModel().create("FARAFormSet", oSendForm, mParams);

                }

            }

        },



        /**

         * Cancel form

         * If it's from creation, it will navigate to master

         * If it's from update, it will reload form

         * @public

         * @param  {sap.ui.base.Event} oEvent Press event

         */

        onCancel: function(oEvent){

            var fCancelCallback;

            fCancelCallback = function(sCB){

                if(sCB === sap.m.MessageBox.Action.OK){

                    var sWorkItemId = this.getCompModel("FaraFormModel").getProperty("/workItemId");

                    if(sWorkItemId && sWorkItemId !== "000000000000"){

                        this.getEventBus().publish("FaraForm", "ReloadFormsAfterCreateUpdate", {id: this._sFormId});

                        this._loadForm(this._sFormId);

                    } else {

                        this.onNavBack();

                    }

                }

            };

            this.confirm("faraForm.sureCancel", fCancelCallback);

        },



        /**

         * Approve form

         * @public

         * @param  {sap.ui.base.Event} oEvent Press event

         */

        onApprove: function(oEvent){

            var sFormId = this._sFormId;
            var sWorkItemId = this.getCompModel("FaraFormModel").getProperty("/workItemId");



            var mSubmitFormParams = {

                urlParameters: {

                    "FormId" : sFormId,

                    "WorkitemID" : sWorkItemId,

                    "CurrentUser": this.getCompModel("user").oData.d.UserName

                },

                success: function(oData, result){

                    if(oData.ApproveWorkitem.Success){

                        var fReloadForm = function(){

                            this.switchOffBusy();

                            this.getEventBus().publish("FaraForm", "ReloadFormsAfterCreateUpdate", {id: this._sFormId});

                            this._loadForm(this._sFormId);

                        }.bind(this);



                        this.alert("faraForm.submit.success.approve", "S", fReloadForm, [this._sFormId, sWorkItemId]);

                    } else {

                        this.alert(

                            "faraForm.submit.error.approveWithId",

                            "E",

                            function(){this.switchOffBusy();}.bind(this),

                            [this._sFormId, sWorkItemId]

                        );

                    }

                }.bind(this),

                error: function(oError){

                    this.alert(

                        "faraForm.submit.error.approveError",

                        "E",

                        function(){this.switchOffBusy();}.bind(this),

                        [this._sFormId, sWorkItemId, oError.response.requestUri, oError.response.statusCode, oError.response.statusText, JSON.parse(oError.response.body).error.message.value]

                    );

                }.bind(this)

            };

            this.switchOnBusy();

            this.getCompModel().callFunction("ApproveWorkitem", mSubmitFormParams);

        },



        /**

         * Reject form, before calling the function import, it will show a popup to input a reason

         * @public

         * @param  {sap.ui.base.Event} oEvent Press event

         */

        onReject: function(oEvent){

          if(!this._oReasonRejectionDialog){

              this._oReasonRejectionDialog = sap.ui.xmlfragment("news.uk.fara.fragment.ReasonRejectionDialog", this);

              this.getView().addDependent(this._oReasonRejectionDialog);

          }



          this.getCompModel("ReasonRejectionDialogModel").setProperty("/text", "");

          this._oReasonRejectionDialog.open();
        },

        /**

         * Controls that there is a reason for rejection and after that, it calls the function import
         * for rejecting the form

         * @public

         * @param  {sap.ui.base.Event} oEvent Press event

         */
        onReasonRejectionContinue: function(oEvent) {
          var sFormId = this._sFormId;
          var sReason = this.getCompModel("ReasonRejectionDialogModel").getProperty("/text");

          if(sReason){
            var sWorkItemId = this.getCompModel("FaraFormModel").getProperty("/workItemId");

            var mSubmitFormParams = {
              urlParameters: {
                "FormId" : sFormId,
                "RejectionReason" : sReason,
                "WorkitemID" : sWorkItemId,
                "CurrentUser": this.getCompModel("user").oData.d.UserName
              },
              success: function(oData, result){
                if(oData.RejectWorkitem.Success){
                    var fReloadForm = function(){
                        this.switchOffBusy();
                        this.getEventBus().publish("FaraForm", "ReloadFormsAfterCreateUpdate", {id: this._sFormId});
                        this._loadForm(this._sFormId);
                    }.bind(this);

                    this.alert("faraForm.submit.success.reject", "S", fReloadForm, [this._sFormId, sWorkItemId]);
                } else {
                    this.alert(
                        "faraForm.submit.error.rejectWithId",
                        "E",
                        function(){this.switchOffBusy();}.bind(this),
                        [this._sFormId, sWorkItemId]
                    );
                }
              }.bind(this),
              error: function(oError){
                this.alert(
                    "faraForm.submit.error.rejectError",
                    "E",
                    function(){this.switchOffBusy();}.bind(this),
                    [this._sFormId, sWorkItemId, oError.response.requestUri, oError.response.statusCode, oError.response.statusText, JSON.parse(oError.response.body).error.message.value]
                );
              }.bind(this)
            };
            this.switchOnBusy();
            this.getCompModel().callFunction("RejectWorkitem", mSubmitFormParams);

            this._oReasonRejectionDialog.close();
          } else {
            this.alert(

              "faraForm.reject.mandatoryReason",

              "W"
            );
          }
        },


        /**
         * Event when form resubmitted.
         *
         */
        onResubmit: function(oEvent) {
            this.getCompModel("FaraFormProperties").setProperty("/filterCostCentres", true);
            this._loadCostCenters(this.getCompModel("CurrentUserModel").getProperty("/UserName"), true)

                .then(function(){ 
                   this.switchOffBusy();  
                }.bind(this))

                .catch(function() { 
                }.bind(this));

 
            // Clear the rejection status
            this.getCompModel("FaraFormModel").setProperty("/status", null);
            this.getCompModel("ApprovalHistoryModel").setProperty("/approvalHistory", []);
            this.getCompModel("ApprovalHistoryModel").setProperty("/rejectionReason", "");
            this.getCompModel("FaraFormProperties").setProperty("/canResubmit", false);
            this.getCompModel("FaraFormProperties").setProperty("/canEdit", true);
            this.getCompModel("FaraFormProperties").setProperty("/cancelVisible", true);
            this.getCompModel("FaraFormProperties").setProperty("/creation", false);
            this.getCompModel("FaraFormProperties").setProperty("/resubmission", true);

            this._checkSubmit();


        },
            

        /**

         * Event when user is searched. The user list will only be loaded when at least 3 characters are inputted on the search field

         * @public

         * @param  {sap.ui.base.Event} oEvent Press event

         */

        onUserSearchLiveChange: function(oEvent){

            var oSearchField = oEvent.getSource();



            var bSearched = false;



            if(

                (oSearchField.getId().indexOf("typeAccessSearchAccount") > -1

                && (this.getCompModel("FaraFormProperties").getProperty("/typeOfAccessSearchedValuesVisible") && this.getCompModel("FaraFormModel").getProperty("/typeAccess/yesSelected")))



                ||



                (oSearchField.getId().indexOf("creatingAccessSearchName") > -1 && this.getCompModel("FaraFormProperties").getProperty("/creatingAccessDataVisible"))

            ){

                bSearched = true;

            }



            var sNewValue = oEvent.getParameter("newValue");

            if((sNewValue.length >= 3 && !bSearched) || (sNewValue.length === 3 && bSearched)){

                //Load Suggestion Items

                this._loadUsersSearchModel(sNewValue, oSearchField)

                    .then(function(){

                        oSearchField.setShowSearchButton(true);

                        oSearchField.setEnableSuggestions(true);

                    }.bind(this))

                    .catch(function(){

                        oSearchField.setShowSearchButton(false);

                        oSearchField.setEnableSuggestions(false);

                    }.bind(this));

            } else if(!bSearched) {

                //Remove Suggestion Items

                this._loadUsersSearchModel(null, oSearchField)

                    .then(function(){

                        if(sNewValue.length === 0){

                            oSearchField.setShowSearchButton(true);

                        } else {

                            oSearchField.setShowSearchButton(false);

                        }

                        oSearchField.setEnableSuggestions(false);

                    }.bind(this));

            }

        },



        /**

         * Event when suggestion list is interacted for user search field.

         * Actually we check that at least 3 characters are inputted, for showing it.

         * Also, it won't be shown when a user is selected.

         * @public

         * @param  {sap.ui.base.Event} oEvent Press eventinitAuth

         */

        onSearchUsersSuggestSearch: function(oEvent){

            var sSuggestValue = oEvent.getParameter("suggestValue");

            var oSearchField = oEvent.getSource();



            if(oSearchField.getId().indexOf("typeAccessSearchAccount") > -1){

                if(this.getCompModel("FaraFormProperties").getProperty("/typeOfAccessSearchedValuesVisible") && this.getCompModel("FaraFormModel").getProperty("/typeAccess/yesSelected")){

                    // oSearchField.setEnableSuggestions(false);

                    // oSearchField.suggest(false);

                    oSearchField.setEnableSuggestions(true);

                    oSearchField.suggest(true);

                }

            } else if(oSearchField.getId().indexOf("creatingAccessSearchName") > -1){

                if(this.getCompModel("FaraFormProperties").getProperty("/creatingAccessDataVisible")){

                    // oSearchField.setEnableSuggestions(false);

                    // oSearchField.suggest(false);

                    oSearchField.setEnableSuggestions(true);

                    oSearchField.suggest(true);

                }

            }



            if(sSuggestValue.length >= 3 && this.getCompModel("UsersSearchModel").getProperty("/users").length > 0){

                oSearchField.suggest(true);

            } else {

                oSearchField.suggest(false);

            }

        },



        /**

         * Event when transaction input field is clicked.

         * Will open a selectDialog which will only load transaction list when at least 3 characters are inputted

         * @public

         * @param  {sap.ui.base.Event} oEvent Press event

         */

        onValueHelpTransactions: function(oEvent){

            var aTokens = oEvent.getSource().getTokens();

            if(!this._oTransactionsDialog){

                this._oTransactionsDialog = sap.ui.xmlfragment("news.uk.fara.fragment.TransactionsSelectDialog", this);

                this.getView().addDependent(this._oTransactionsDialog);



                //Gets selectDialog search field for setting the busy indicator delay to 0

                var oSelectDialogSearchField = this._oTransactionsDialog._oSearchField;

                oSelectDialogSearchField.setBusyIndicatorDelay(0);



                //Gets selectDialog list of results to attach selection change so we save the selected or unselected fields independently

                var oDialogList = this._oTransactionsDialog._oList;

                //Saving every selected transactions even in different searchs

                oDialogList.attachSelectionChange({},this._transactionSelected,this);

            }

            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oTransactionsDialog);



            //Resets transactions model, calling the method without parameters

            this._loadTransactionModel()

                .then(function(){

                    //Resets custom transactions list, adding only created Tokens to custom transactons list

                    this._aTransactionsToInsert = [];

                    this._sTransactionSearchQuery = null;



                    for(var i = 0; i < aTokens.length; i++){

                        this._aTransactionsToInsert.push({TCode: aTokens[i].getKey(), TCodeDescription: aTokens[i].getText()});

                    }



                    this._oTransactionsDialog.open();

                }.bind(this));

        },



        /**

         * Event when transactions are selected and OK button is pressed.

         * It recovers our custom list of selected items and parses it into tokens on multiinput field for transactions

         * @public

         * @param  {sap.ui.base.Event} oEvent Press event

         */

        onTransactionsDialogConfirm: function(oEvent){

            var oTransactionsMultiInput = this.byId("transactionsMultiInput");

            oTransactionsMultiInput.destroyTokens();



            this._aTransactionsToInsert.forEach(function(oTransactionToInsert){

                oTransactionsMultiInput.addToken(new Token({

                    key: oTransactionToInsert.TCode,

                    text: oTransactionToInsert.TCodeDescription

                }));

            }.bind(this));

        },



        /**

         * Event when transactions close button is pressed on transactions selection.

         * Actually nothing is done, but maybe in the future any operative will be needed

         * @public

         * @param  {sap.ui.base.Event} oEvent Press event

         */

        onTransactionsDialogClose: function(oEvent){

            //Just in case we need to do something on close button

        },



        /**

         * Event when the search button of transactions dialog is presed.

         * It just calls the livechange method.

         * @public

         * @param  {sap.ui.base.Event} oEvent Press event

         */

        onTransactionSearch: function(oEvent){

            oEvent.getSource().fireLiveChange(oEvent.getParameters());

        },



        /**

         * Event when transaction is searched. The transactions list will only be loaded when at least 3 characters are inputted on the search field

         * @public

         * @param  {sap.ui.base.Event} oEvent Press event

         */

        onTransactionLiveChange: function(oEvent){

            var oSelectDialog = oEvent.getSource();

            var oSelectDialogSearchField = sap.ui.getCore().byId(oSelectDialog.getId() + "-searchField");

            var oListBinding = oEvent.getParameter("itemsBinding");

            var sNewValue = oEvent.getParameter("value");

            if(sNewValue.length >= 3){

                var oTransactionsMultiInput = this.byId("transactionsMultiInput");

                var aTokens = oTransactionsMultiInput.getTokens();



                //Load Transactions

                this._loadTransactionModel(sNewValue, oListBinding, oSelectDialogSearchField)

                    .then(function(){



                    }.bind(this))

                    .catch(function(){



                    }.bind(this));

            } else {

                //Remove Transactions

                this._loadTransactionModel(null, oListBinding, oSelectDialogSearchField)

                    .then(function(){



                    }.bind(this));

            }

        },



        /**

         * Event when elem is selected.

         * @public

         * @param  {sap.ui.base.Event} oEvent Selection Change event

         */

        onElementSelected: function(oEvent){

            this.switchOnBusy();

            var oChangedItem = oEvent.getParameter("changedItem");

            var oMultiComboBox = oEvent.getSource();

            if(oChangedItem.getKey() === this.getConstant("selectAllKey")){

                var bSelected = oEvent.getParameter("selected");



                if(bSelected){

                    oMultiComboBox.setSelectedItems(oMultiComboBox.getItems());

                } else {

                    oMultiComboBox.setSelectedItems();

                }

            } else if(!oEvent.getParameter("selected")) {

                oMultiComboBox.removeSelectedItem(oMultiComboBox.getFirstItem());

            } else {

                var aSelectedKeys = this.getCompModel("FaraFormModel").getProperty(oMultiComboBox.getBindingPath("selectedKeys"));



                var oBindingInfo = oMultiComboBox.getBindingInfo("items");

                if(this._checkSelectedAll(aSelectedKeys, oBindingInfo.model, oBindingInfo.path)){

                    oMultiComboBox.setSelectedItems(oMultiComboBox.getItems());

                }

            }



            var aTokens = oMultiComboBox._oTokenizer.getTokens();

            this._invisibleSelectAllToken(aTokens);



            this.switchOffBusy();

        },


        /**
         * Add department name as group separator for "other department" cost
         * centres
         *
         * @returns {sap.ui.core.SeparatorItem} Separator item
         */
        groupOtherDeptCostCenters: function(oGroup) {
          return new sap.ui.core.SeparatorItem({
            text: oGroup.key,
          });
        },

      

		/* =========================================================== */

		/* begin: internal methods                                     */

		/* =========================================================== */



        /**

         * When a transaction is selected, it will be saved in our custom transaction private list

         * When a transaction is deselected, it will be removed from our custom transaction private list

         * @private

         * @param  {sap.ui.base.Event} oEvent Select event

         */

        _transactionSelected: function(oEvent){

            var oTransaction = oEvent.getParameter("listItem").getBindingContext("TransactionsModel").getProperty();

            if(oEvent.getParameter("selected")){

                this._aTransactionsToInsert.push(oTransaction);

            } else {

                this._aTransactionsToInsert = this._aTransactionsToInsert.filter(function(oContainedTransaction){

                    return oContainedTransaction.TCode !== oTransaction.TCode;

                });

            }

        },



        /**

         * Searchs Account to copy

         * Second version, where inputing 3 chars triggers the loading of the model

         * @private

         * @param  {string} sQuery User to search

         * @param  {object} oSearcField Search field control

         */

        _loadUsersSearchModel: function(sQuery, oSearchField){

            return new Promise(function(resolve, reject){

                var oBinding = oSearchField.getBinding("suggestionItems");

                if(sQuery){

                    var mParams = {

                        success: function(oData, result){

                            this.getCompModel("UsersSearchModel").setProperty("/users", oData.results);

                            this.switchOffBusy();

                            return resolve();

                        }.bind(this),



                        error: function(oError){

                            this.alert(

                                "faraForm.models.userLookupError",

                                "E",

                                function(){this.switchOffBusy();}.bind(this),

                                [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]

                            );

                            return reject();

                        }.bind(this),

                        urlParameters:{ "search" : sQuery }

                    };



                    if(this.getCompModel("UsersSearchModel").getProperty("/users").length === 0

                        || this._sUsersSearchQuery.length > sQuery.length

                        || (this._sUsersSearchQuery.length === sQuery.length && this._sUsersSearchQuery !== sQuery)

                        || !sQuery.startsWith(this._sUsersSearchQuery)){

                        this.switchOnBusy();

                        this.getCompModel().read("UserLookupSet", mParams);

                        this._sUsersSearchQuery = sQuery;

                    } else {

                        var oUserNameFilter = new Filter({

                            path: "UserName",

                            operator: sap.ui.model.FilterOperator.Contains,

                            value1: sQuery

                        });

                        var oFullNameFilter = new Filter({

                            path: "FullName",

                            operator: sap.ui.model.FilterOperator.Contains,

                            value1: sQuery

                        });

                        var oJobTitleFilter = new Filter({

                            path: "JobTitle",

                            operator: sap.ui.model.FilterOperator.Contains,

                            value1: sQuery

                        });

                        var oFullFilter = new Filter({

                            filters: [oUserNameFilter, oFullNameFilter, oJobTitleFilter],

                            and: false

                        });



                        oBinding.filter(oFullFilter);

                        return resolve();

                    }

                } else {

                    if(this.getCompModel("UsersSearchModel").getProperty("/users").length > 0){

                        oBinding.filter([]);

                        this.getCompModel("UsersSearchModel").setProperty("/users", []);

                        this._sUsersSearchQuery = "";

                    }

                    return resolve();

                }

            }.bind(this));

        },



        /**

         * Transactions load

         * @private

         * @param  {string} sQuery Transaction to search

         * @param  {object} oBinding Search field binding

         * @param  {object} oSelectDialogSearchField Select Dialog Search Field, for setting it's busy property to true/false when searching

         */

        _loadTransactionModel: function(sQuery, oBinding, oSelectDialogSearchField){

            return new Promise(function(resolve, reject){

                if(sQuery){

                    var mParams = {

                        success: function(oData, result){

                            var aResults = oData.results;



                            // If a loaded transaction exists in the token list, it means that it's been selected before, so we set it as selected

                            // This is useful so we can make many different searches and select different data, so every selected data will remain

                            if(this._aTransactionsToInsert){

                                for(var x = 0; x < this._aTransactionsToInsert.length; x++){

                                    for(var y = 0; y <aResults.length; y++){

                                        if(this._aTransactionsToInsert[x].TCode === aResults[y].TCode){

                                            aResults[y].Selected = true;

                                        }

                                    }

                                }

                            }



                            this.getCompModel("TransactionsModel").setProperty("/transactions", aResults);

                            if(oSelectDialogSearchField){

                                oSelectDialogSearchField.setBusy(false);

                            }

                            return resolve();

                        }.bind(this),



                        error: function(oError){

                            this.alert(

                                "faraForm.models.transactionLookupError",

                                "E",

                                function(){

                                    if(oSelectDialogSearchField){

                                        oSelectDialogSearchField.setBusy(false);

                                    }

                                }.bind(this),

                                [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]

                            );

                            return reject();

                        }.bind(this),



                        urlParameters:{"search" : sQuery}

                    };



                    if(this.getCompModel("TransactionsModel").getProperty("/transactions").length === 0

                        || this._sTransactionSearchQuery.length > sQuery.length

                        || (this._sTransactionSearchQuery.length === sQuery.length && this._sTransactionSearchQuery !== sQuery)

                        || !sQuery.startsWith(this._sTransactionSearchQuery)){

                        if(oSelectDialogSearchField){

                            oSelectDialogSearchField.setBusy(true);

                        }

                        this.getCompModel().read("TransactionCodeSet", mParams);

                        this._sTransactionSearchQuery = sQuery;

                    } else {

                        var oTCodeFilter = new Filter({

                            path: "TCode",

                            operator: sap.ui.model.FilterOperator.Contains,

                            value1: sQuery

                        });

                        var oTCodeDescriptionFilter = new Filter({

                            path: "TCodeDescription",

                            operator: sap.ui.model.FilterOperator.Contains,

                            value1: sQuery

                        });

                        var oFullFilter = new Filter({

                            filters: [oTCodeFilter, oTCodeDescriptionFilter],

                            and: false

                        });



                        oBinding.filter(oFullFilter);

                        return resolve();

                    }

                } else {

                    if(this.getCompModel("TransactionsModel").getProperty("/transactions").length > 0){

                        if(oBinding){

                            oBinding.filter([]);

                        }

                        this.getCompModel("TransactionsModel").setProperty("/transactions", []);

                        this._sTransactionSearchQuery = "";

                    }

                    return resolve();

                }

            }.bind(this));

        },



        /**

         * Looks for a transaction.

         * Used when recovering transaction data from a created form

         * @private

         * @param  {string} sQuery Transaction to search

         */

        _searchTransaction: function(sQuery){

            return new Promise(function(resolve, reject){



                var mParams = {

                    success: function(oData, result){

                        return resolve(oData.results[0]);

                    }.bind(this),



                    error: function(oError){

                        this.alert(

                            "faraForm.models.transactionLookupError",

                            "E",

                            function(){}.bind(this),

                            [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]

                        );

                        return reject();

                    }.bind(this),



                    urlParameters:{"search" : sQuery}

                };



                this.getCompModel().read("TransactionCodeSet", mParams);



            }.bind(this));

        },



        /**

         * Searchs Account to copy

         * Second version, after selecting an user from suggestion list

         * @private

         * @param  {sap.ui.base.Event} oEvent Search event

         */

        _loadSelectedUser: function(sQuery, fSuccess, bExpandRoleSet){

            var oUrlParams = {};

            if(bExpandRoleSet){

                oUrlParams = {"$expand": 'Roles'};

            }



            var mParams = {

                success: fSuccess.bind(this),

                error: function(oError){

                    this.alert(

                        "faraForm.models.userLookupError",

                        "E",

                        function(){this.switchOffBusy();}.bind(this),

                        [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]

                    );

                }.bind(this),

                urlParameters: oUrlParams

            };



            this.switchOnBusy();

            this.getCompModel().read("UserSet('" + sQuery + "')", mParams);

        },



        /**

         * Searchs Account to copy

         * First version, where the search button makes the two steps-search

         * @public

         * @param  {sap.ui.base.Event} oEvent Search event

         */

        _searchAndLoad: function(sQuery, fCleanData, fSuccessUserSet, bExpandRoleSet){

            var fError = function(oError){

                this.alert(

                    "faraForm.models.userLookupError",

                    "E",

                    function(){this.switchOffBusy();}.bind(this),

                    [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]

                );

            };



            var mParams = {

                success: function(oData, result){

                    if(oData.results.length > 0){

                        var oUser = oData.results[0];



                        var oUrlParams = {};

                        if(bExpandRoleSet){

                            oUrlParams = {"$expand": 'Roles'};

                        }



                        var mParamsUserSet = {

                            success: fSuccessUserSet.bind(this),

                            error: fError.bind(this),

                            urlParameters: oUrlParams

                        };



                        this.getCompModel().read("UserSet('" + oUser.UserName + "')", mParamsUserSet);

                    } else {

                        this.alert("faraForm.typeAccess.warningNoUserFound", "W", fCleanData, sQuery);

                    }

                }.bind(this),



                error: fError.bind(this),



                urlParameters:{"search" : sQuery}

            };



            this.switchOnBusy();

            this.getCompModel().read("UserLookupSet", mParams);



        },



        /**

         * Reloads form values and parameters

         * @private

         */

        _reloadForm: function(){

            var sUrlForm = "localresources/jsonModel/faraFormModel.json";

            var oFaraFormModel = this.getCompModel("FaraFormModel");

            oFaraFormModel.loadData(sUrlForm, "", false);



            var sUrlProperties = "localresources/jsonModel/faraFormProperties.json";

            var oFaraFormProperties = this.getCompModel("FaraFormProperties");

            oFaraFormProperties.loadData(sUrlProperties, "", false);



            var oCodiingGroupsApproverText = this.byId("codiingGroupsText");

            oCodiingGroupsApproverText.removeStyleClass("requiredText");



            var oCodiingGroupsCoderText = this.byId("codiingGroupsCoderText");

            oCodiingGroupsCoderText.removeStyleClass("requiredText");



            var oPublications = this.byId("PublicationsRadioButtonGroup");

            if (oPublications != undefined) {
                var aPublicationsButtons = oPublications.getButtons();

                for(var i = 0; i < aPublicationsButtons.length; i++){

                    aPublicationsButtons[i].setSelected(false);

                }

            }
        

            this.getCompModel("FaraFormModel").getProperty("/cms/departmentSelected", this._sFirstDepartmentId);

        },



        /**

         * Gets ID from the event and init models sending the form ID as a pasameter.

         * This is so the form loading will be done AFTER loading main models.

         * @private

         */

        _loadModelsAndForm: function(sChannel, sMethod, oParams){

            this._sFormId = oParams.id;

            this._initModels(this._sFormId);

        },



        /**

         * Gets Work Item Id.

         * @private

         */

        _getWorkItemId: function(sChannel, sMethod, oParams){

            oParams.id = this.getCompModel("FaraFormModel").getProperty("/workItemId");

        },



        /**

         * First step for loading form data.

         * @private

         * @param  {string} sId Form ID

         */

        _loadForm: function(sId){

            this.switchOnBusy();



            this._loadFormFromID(sId)

                .then(function(oFormData){

                    if(oFormData){

                        var oCurrentUser = this.getCompModel("CurrentUserModel").getData();



                        //If everything is recovered ok, continue with parsing users

                        this._parseUsers(oFormData, oCurrentUser);

                    } else {

                        this.alert(

                            "faraForm.error.FormNotFound",

                            "W",

                            function(){this.switchOffBusy(); this.navTo("CreateFaraForm");}.bind(this),

                            [sId]

                        );

                    }

                }.bind(this))

                .catch(function(oError) {

                    this.alert(

                        "faraForm.models.readFormError",

                        "E",

                        function(){this.switchOffBusy();}.bind(this),

                        [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]

                    );

                }.bind(this));

        },



        /**

         * Second step for loading form data.

         * Parses users data.

         * @private

         * @param  {object} oFormData Loaded form data

         * @param  {object} oCurrentUser Current user data

         */

        _parseUsers: function(oFormData, oCurrentUser){

            //Functions to recover users data

            var aRecoverUserFunctions = [];



            //Checks user Id to Copy

            var oUserToCopy;

            var sUserIdToCopy = oFormData.UserIdToCopy;

            //If user Id to Copy is the same as current user, copy the data, if it isn't, it saves a promise to look for it on the server

            if(sUserIdToCopy === oCurrentUser.UserName){

                oUserToCopy = jQuery.extend(true, {}, oCurrentUser);

            } else {

                if(sUserIdToCopy){

                    aRecoverUserFunctions.push(this._searchUserData(this.getConstant("userIdToCopyKey"), sUserIdToCopy, true));

                }

            }



            //Checks user Id requiring Access

            var oUserRequiringAccess;

            var sUserIdReqAccess = oFormData.UserIdReqAccess;

            //If user Id to Require access is the same as current user, copy the data, if it isn't, it saves a promise to look for it on the server

            if(sUserIdReqAccess === oCurrentUser.UserName){

                oUserRequiringAccess = jQuery.extend(true, {}, oCurrentUser);

            } else {

                if(sUserIdReqAccess){

                    aRecoverUserFunctions.push(this._searchUserData(this.getConstant("userReqAccessKey"), sUserIdReqAccess));

                }

            }



            //If there are promises saved, execute them and continue after. If there aren't any, directly continue.

            if(aRecoverUserFunctions.length > 0){

                Promise.all(aRecoverUserFunctions)

                    .then(function(aAllData){

                        aAllData.forEach(function(oRecoveredData){

                            switch(oRecoveredData.key){

                                case this.getConstant("userIdToCopyKey"):

                                    oUserToCopy = oRecoveredData.user;

                                    break;

                                case this.getConstant("userReqAccessKey"):

                                    oUserRequiringAccess = oRecoveredData.user;

                                    break;

                            }

                        }.bind(this));



                        //Continue parsing the transactions

                        this._parseTransactions(oFormData, oCurrentUser, oUserToCopy, oUserRequiringAccess);

                    }.bind(this))

                    .catch(function(oError) {

                        this.alert(

                            "faraForm.models.userLookupError",

                            "E",

                            function(){this.switchOffBusy();}.bind(this),

                            [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]

                        );

                    }.bind(this));

            } else {

                //Continue parsing the transactions

                this._parseTransactions(oFormData, oCurrentUser, oUserToCopy, oUserRequiringAccess);

            }

        },



        /**

         * Third step for loading form data.

         * Parses transaction data.

         * @private

         * @param  {object} oFormData Loaded form data

         * @param  {object} oCurrentUser Current user data

         * @param  {object} oUserToCopy User to copy data

         * @param  {object} oUserRequiringAccess User requiring access

         */

        _parseTransactions: function(oFormData, oCurrentUser, oUserToCopy, oUserRequiringAccess){

            var aTransaction = oFormData.Transactions.split(",");

            var aTransactionPromises = [];



            // If there are transactions, generate a promise for every transaction, to recover every data

            if(oFormData.Transactions){

                aTransaction.forEach(function(sTransactionKey){

                    aTransactionPromises.push(this._searchTransaction(sTransactionKey));

                }.bind(this));

            }



            // If we have promises, we transform the result data of the transaction search to tokens and continue.

            // If we don't have promises, we directly continue.

            if(aTransactionPromises.length > 0){

                Promise.all(aTransactionPromises)

                    .then(function(aAllData){

                        aAllData.forEach(function(oRecoveredData){

                            var oTransactionsMultiInput = this.byId("transactionsMultiInput");

                            oTransactionsMultiInput.addToken(new Token({

                                key: oRecoveredData.TCode,

                                text: oRecoveredData.TCodeDescription

                            }));

                        }.bind(this));



                        //Continue to fourth step

                        this._parsePublicationId(oFormData, oCurrentUser, oUserToCopy, oUserRequiringAccess);

                    }.bind(this))

                    .catch(function(oError) {

                        this.alert(

                            "faraForm.models.transactionLookupError",

                            "E",

                            function(){this.switchOffBusy();}.bind(this),

                            [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]

                        );

                    }.bind(this));

            } else {

                //Continue to fourth step

                this._parsePublicationId(oFormData, oCurrentUser, oUserToCopy, oUserRequiringAccess);

            }

        },



        /**

         * Fourth step for loading form data.

         * Recovers publication ID if exists and loads ECS cost centers

         * @private

         * @param  {object} oFormData Loaded form data

         * @param  {object} oCurrentUser Current user data

         * @param  {object} oUserToCopy User to copy data

         * @param  {object} oUserRequiringAccess User requiring access

         */

        _parsePublicationId: function(oFormData, oCurrentUser, oUserToCopy, oUserRequiringAccess){

            var sECSPublicationID = oFormData.ECSPublicationID;

            var oPublications = this.byId("PublicationsRadioButtonGroup");


            if (oPublications == undefined) {
                //Continue to fifth step

                this._parseDepartmentId(oFormData, oCurrentUser, oUserToCopy, oUserRequiringAccess);

                return;
            }

            var aPublicationsButtons = oPublications.getButtons();

            if(sECSPublicationID){

                for(var i = 0; i < aPublicationsButtons.length; i++){

                    if(sECSPublicationID === aPublicationsButtons[i].data("pubId")){

                        aPublicationsButtons[i].setSelected(true);

                    }

                }



                this._loadPublicationCostCenters(sECSPublicationID, true)

                    .then(function(){

                        //Continue to fifth step

                        this._parseDepartmentId(oFormData, oCurrentUser, oUserToCopy, oUserRequiringAccess);

                    }.bind(this))

                    .catch(function(oError) {

                        this.alert(

                            "faraForm.models.pubCostCentersError",

                            "E",

                            function(){this.switchOffBusy();}.bind(this),

                            [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]

                        );

                    }.bind(this));

            } else {

                for(var j = 0; j < aPublicationsButtons.length; j++){

                    aPublicationsButtons[j].setSelected(false);

                }



                //Continue to fifth step

                this._parseDepartmentId(oFormData, oCurrentUser, oUserToCopy, oUserRequiringAccess);

            }

        },



        /**

         * Fifth step for loading form data.

         * Recovers department ID if exists and loads CMS cost centers

         * @private

         * @param  {object} oFormData Loaded form data

         * @param  {object} oCurrentUser Current user data

         * @param  {object} oUserToCopy User to copy data

         * @param  {object} oUserRequiringAccess User requiring access

         */

        _parseDepartmentId: function(oFormData, oCurrentUser, oUserToCopy, oUserRequiringAccess){

            var sCMSDepartmentID = oFormData.CMSDepartmentID;

            if(sCMSDepartmentID){

                this._loadDepartmentCostCenters(sCMSDepartmentID, true)

                    .then(function(){

                        //Continue to sixth step

                        // this._parseFormData(oFormData, oCurrentUser, oUserToCopy, oUserRequiringAccess);

                        this._getFIWorkItemId(oFormData, oCurrentUser, oUserToCopy, oUserRequiringAccess);

                    }.bind(this))

                    .catch(function(oError) {

                        this.alert(

                            "faraForm.models.depCostCentersError",

                            "E",

                            function(){this.switchOffBusy();}.bind(this),

                            [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]

                        );

                    }.bind(this));

            } else {

                //Continue to sixth step

                // this._parseFormData(oFormData, oCurrentUser, oUserToCopy, oUserRequiringAccess);

                this._getFIWorkItemId(oFormData, oCurrentUser, oUserToCopy, oUserRequiringAccess);

            }

        },



        /**

         * Sixth step for loading form data.

         * Recovers work item ID

         * @private

         * @param  {object} oFormData Loaded form data

         * @param  {object} oCurrentUser Current user data

         * @param  {object} oUserToCopy User to copy data

         * @param  {object} oUserRequiringAccess User requiring access

         */

       _getFIWorkItemId: function(oFormData, oCurrentUser, oUserToCopy, oUserRequiringAccess){

         var sUserName = this.getCompModel("user").oData.d.UserName;

         if(sUserName){

             this._FIWorkItemId(this._sFormId)

                 .then(function(oData){

                     this._parseFormData(oFormData, oCurrentUser, oUserToCopy, oUserRequiringAccess, oData.CheckWorkitem.WorkItemIdNbr);

                 }.bind(this))

                 .catch(function(oError) {

                     this.alert(

                         "faraForm.models.getWorkItemError",

                         "E",

                         function(){this.switchOffBusy();}.bind(this),

                         [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]

                     );

                 }.bind(this));

         } else {

             //Continue to last step

             this._parseFormData(oFormData, oCurrentUser, oUserToCopy, oUserRequiringAccess, "");

         }

       },



        /**

         * Final step for loading form data.

         * Parses every data into the JSONModel for the final form loaded.

         * @private

         * @param  {object} oFormData Loaded form data

         * @param  {object} oCurrentUser Current user data

         * @param  {object} oUserToCopy User to copy data

         * @param  {object} oUserRequiringAccess User requiring access

         */

        _parseFormData: function(oFormData, oCurrentUser, oUserToCopy, oUserRequiringAccess, sWorkItemId){

            var oFormModelData = {

                areaRequestForm: {

                    approvedSignatureSelected: oFormData.FormType === "A",

                    sapSelected: oFormData.FormType === "S"

                },

                whoRequiresForm: {

                    yourselfSelected: (oFormData.UserIdReqAccess === oFormData.CreatedBy && (oFormData.FormType === "S" || oFormData.FormType === "A")) ? true : false,

                    someoneElseSelected: (oFormData.UserIdReqAccess !== oFormData.CreatedBy && (oFormData.FormType === "S" || oFormData.FormType === "A")) ? true : false

                },

                yourDetailsForm: {

                    // name: oCurrentUser.FullName,

                    // jobTitle: oCurrentUser.JobTitle,

                    // department: oCurrentUser.Department,

                    // manager: oCurrentUser.ManagerFullName,

                    // phone: oFormData.Phone,

                    // mail: oCurrentUser.Email

                    name: oUserRequiringAccess ? oUserRequiringAccess.FullName : '',

                    jobTitle: oUserRequiringAccess ? oUserRequiringAccess.JobTitle : '',

                    department: oUserRequiringAccess ? oUserRequiringAccess.Department : '',

                    homeCostCenter: oUserRequiringAccess ? oUserRequiringAccess.CostCenter: '',

                    homeCostCenterName: oUserRequiringAccess ? oUserRequiringAccess.CostCenterName: '',

                    manager: oUserRequiringAccess ? oUserRequiringAccess.ManagerFullName : '',

                    phone: oFormData.Phone,

                    mail: oUserRequiringAccess ? oUserRequiringAccess.Email : ''

                },

                requireAccess:{

                    yesSelected: (oFormData.UserIdToCopy ? true : false) || (oFormData.Transactions ? true : false) || (oFormData.Roles ? true : false),

                    noSelected: (oFormData.UserIdToCopy ? false : true) && (oFormData.Transactions ? false : true) && (oFormData.Roles ? false : true)

                },

                typeAccess: {

                    userId: oUserToCopy ? oUserToCopy.UserName : '',

                    yesSelected: (oUserToCopy ? true : false),

                    noSelected: (oFormData.Transactions ? true : false) || (oFormData.Roles ? true : false),

                    searchAccountToCopy: oUserToCopy ? oUserToCopy.FullName : '',

                    jobTitle: oUserToCopy ? oUserToCopy.JobTitle : '',

                    department: oUserToCopy ? oUserToCopy.Department : '',

                    manager: oUserToCopy ? oUserToCopy.ManagerFullName : '',

                    addNewTransactionSelected: ((oFormData.Transactions ? true : false) && (oFormData.Roles ? true : false)),

                    addNewRoleSelected: ((!oFormData.Transactions ? true : false) && (oFormData.Roles ? true : false)),

                    roles: oUserToCopy ? oUserToCopy.Roles : ''

                },

                newTransaction: {

                    // costCentersKeys: oFormData.Transactions.split(","),

                    rolesKeys: oFormData.Transactions ? oFormData.Roles.split(",") : []

                },

                newRole: {

                    rolesKeys: oFormData.Transactions ? [] : oFormData.Roles.split(",")

                },

                creatingAccess: {

                    userId: oUserRequiringAccess ? oUserRequiringAccess.UserName : '',

                    name: oUserRequiringAccess ? oUserRequiringAccess.FullName : '',

                    jobTitle: oUserRequiringAccess ? oUserRequiringAccess.JobTitle : '',

                    department: oUserRequiringAccess ? oUserRequiringAccess.Department : '',

                    homeCostCenter: oUserRequiringAccess ? oUserRequiringAccess.CostCenter: '',

                    homeCostCenterName: oUserRequiringAccess ? oUserRequiringAccess.CostCenterName: '',

                    manager: oUserRequiringAccess ? oUserRequiringAccess.ManagerFullName : '',

                    phone: oFormData.Phone,

                    mail: oUserRequiringAccess ? oUserRequiringAccess.Email : ''

                },

                otherFinancialSystems: {

                    yesSelected: (oFormData.InvoiceCoderReq === "X" || oFormData.ExpenseApproverRoleReq === "X" || oFormData.ExpenseValidatorRoleReq === "X"

                    || oFormData.SRMBuyerRoleReq === "X" || oFormData.SRMApproverRoleReq === "X" || oFormData.PMPORoleReq === "X"

                    || oFormData.PMMRPRoleReq === "X" || oFormData.ECSCommissionEditorRoleReq === "X" || oFormData.ECSDeskAdminitratorRoleReq === "X"

                    || oFormData.ECSDeskheadApproverRoleReq === "X" || oFormData.ECSContribCoordinatRoleReq === "X" || oFormData.ECSManagingEditorRoleReq === "X"

                    || oFormData.CMSDeskheadRoleReq === "X" || oFormData.CMSRegionalApprovRoleReq === "X" || oFormData.CMSManagingEditorRoleReq === "X"

                    || oFormData.ECSPublicationID.length > 0 || oFormData.CMSDepartmentID.length > 0),

                    noSelected: !(oFormData.InvoiceCoderReq === "X" || oFormData.ExpenseApproverRoleReq === "X" || oFormData.ExpenseValidatorRoleReq === "X"

                    || oFormData.SRMBuyerRoleReq === "X" || oFormData.SRMApproverRoleReq === "X" || oFormData.PMPORoleReq === "X"

                    || oFormData.PMMRPRoleReq === "X" || oFormData.ECSCommissionEditorRoleReq === "X" || oFormData.ECSDeskAdminitratorRoleReq === "X"

                    || oFormData.ECSDeskheadApproverRoleReq === "X" || oFormData.ECSContribCoordinatRoleReq === "X" || oFormData.ECSManagingEditorRoleReq === "X"

                    || oFormData.CMSDeskheadRoleReq === "X" || oFormData.CMSRegionalApprovRoleReq === "X" || oFormData.CMSManagingEditorRoleReq === "X"

                    || oFormData.ECSPublicationID.length > 0 || oFormData.CMSDepartmentID.length > 0)

                },

                codingGroup: {

                    yesSelected: oFormData.InvoiceCoderReq === "X",

                    coderCodingGroupsKeys: oFormData.InvoiceCoderCodingGroups.split(",")

                },

                "expences": {

                    yesSelected: oFormData.ExpenseApproverRoleReq === "X" || oFormData.ExpenseValidatorRoleReq === "X",

                    approverSelected: oFormData.ExpenseApproverRoleReq === "X",

                    validatorSelected: oFormData.ExpenseValidatorRoleReq === "X",

                    //TODO Still to know where to get this field

                    "costCentersKeys": []

                },

                srm: {

                    yesSelected: oFormData.SRMBuyerRoleReq === "X" || oFormData.SRMApproverRoleReq === "X",

                    buyerSelected: oFormData.SRMBuyerRoleReq === "X",

                    approverSelected: oFormData.SRMApproverRoleReq === "X"

                },

                stockApproval: {

                    yesSelected: oFormData.PMPORoleReq === "X" || oFormData.PMMRPRoleReq === "X",

                    productionPucharseSelected: oFormData.PMPORoleReq === "X",

                    productionMRPSelected: oFormData.PMMRPRoleReq === "X"

                },

                ecs: {

                    yesSelected: oFormData.ECSCommissionEditorRoleReq === "X" || oFormData.ECSDeskAdminitratorRoleReq === "X"

                    || oFormData.ECSDeskheadApproverRoleReq === "X" || oFormData.ECSContribCoordinatRoleReq === "X" || oFormData.ECSManagingEditorRoleReq === "X"

                    || oFormData.ECSPublicationID.length > 0,

                    comissioningEditorSelected: oFormData.ECSCommissionEditorRoleReq === "X",

                    deskAdministratorSelected: oFormData.ECSDeskAdminitratorRoleReq === "X",

                    deskHeadApproverSelected: oFormData.ECSDeskheadApproverRoleReq === "X",

                    contributionsCoordinatorSelected: oFormData.ECSContribCoordinatRoleReq === "X",

                    managingEditorSelected: oFormData.ECSManagingEditorRoleReq === "X",

                    costCentersKeys: oFormData.ECSCostCentres.split(",")

                },

                cms: {

                    yesSelected: oFormData.CMSDeskheadRoleReq === "X" || oFormData.CMSRegionalApprovRoleReq === "X" || oFormData.CMSManagingEditorRoleReq === "X"

                    || oFormData.CMSDepartmentID.length > 0,

                    deskHeadSelected: oFormData.CMSDeskheadRoleReq === "X",

                    regionalApproverSelected: oFormData.CMSRegionalApprovRoleReq === "X",

                    managingEditorSelected: oFormData.CMSManagingEditorRoleReq === "X",

                    costCentersKeys: oFormData.CMSCostCentres.split(","),

                    departmentSelected: oFormData.CMSDepartmentID || this._sFirstDepartmentId

                },

                aslAuth: {

                    invoicesYesSelected: oFormData.InvoiceApproverReq === "X",

                    invoicesNoSelected: oFormData.InvoiceApproverReq !== "X",

                    // coderYesSelected: oFormData.InvoiceCoderReq === "X",

                    levelSelected: oFormData.ASLLevel,

                    costCentersKeys: oFormData.ASLCostCenters.split(","),

                    costCentersOtherDeptKeys: oFormData.ASLCostCentersOtherDept.split(","),

                    costCenterDeptsKeys: oFormData.ASLCostCenterDepartments.split(","),

                    approverCodingGroupsKeys: oFormData.InvoiceApproverCodingGroups.split(","),

                    costCenterOtherDeptYesSelected: oFormData.ASLOtherDeptCostCentersReq === "X",
                    costCenterOtherDeptNoSelected: oFormData.ASLOtherDeptCostCentersReq !== "X",
                    approveDeptYesSelected: oFormData.ASLDeptApprovalReq === "X",
                    approveDeptNoSelected: oFormData.ASLDeptApprovalReq !== "X"



                    // coderCodingGroupsKeys: oFormData.InvoiceCoderCodingGroups.split(",")

                },

                // workItemId: oFormData.WorkitemID,

                workItemId: sWorkItemId,

                status: oFormData.Status,

                // Test value

                // workItemId: "000009181497"



                createdBy: oFormData.CreatedBy,

                createdOn: oFormData.CreatedOn

            };



            //Check All Selected

            if(this._checkSelectedAll(oFormModelData.aslAuth.costCentersKeys, "CostCentersModel", "/costCenters")){

                oFormModelData.aslAuth.costCentersKeys.unshift(this.getConstant("selectAllKey"));

            }


            if(this._checkSelectedAll(oFormModelData.aslAuth.costCentersOtherDeptKeys, "CostCentersOtherDeptModel", "/costCenters")){

                oFormModelData.aslAuth.costCentersOtherDeptKeys.unshift(this.getConstant("selectAllKey"));

            }


            if(this._checkSelectedAll(oFormModelData.aslAuth.costCenterDeptsKeys, "CostCenterDeptsModel", "/departments")){

                oFormModelData.aslAuth.costCenterDeptsKeys.unshift(this.getConstant("selectAllKey"));

            }



            if(this._checkSelectedAll(oFormModelData.expences.costCentersKeys, "CostCentersModel", "/costCenters")){

                oFormModelData.expences.costCentersKeys.unshift(this.getConstant("selectAllKey"));

            }



            if(this._checkSelectedAll(oFormModelData.ecs.costCentersKeys, "PublicationCostCentersModel", "/costCenters")){

                oFormModelData.ecs.costCentersKeys.unshift(this.getConstant("selectAllKey"));

            }



            if(this._checkSelectedAll(oFormModelData.cms.costCentersKeys, "DepartmentCostCentersModel", "/costCenters")){

                oFormModelData.cms.costCentersKeys.unshift(this.getConstant("selectAllKey"));

            }



            this.getCompModel("FaraFormModel").setData(oFormModelData);



            var oCodiingGroupsApproverText = this.byId("codiingGroupsText");

            if(oFormModelData.aslAuth.invoicesYesSelected){

                oCodiingGroupsApproverText.addStyleClass("requiredText");

            } else {

                oCodiingGroupsApproverText.removeStyleClass("requiredText");

            }



            // var oCodiingGroupsCoderText = this.byId("codiingGroupsCoderText");

            // if(oFormModelData.aslAuth.coderYesSelected){

            // 	oCodiingGroupsCoderText.addStyleClass("requiredText");

            // } else {

            // 	oCodiingGroupsCoderText.removeStyleClass("requiredText");

            // }





            if(oFormModelData.areaRequestForm.sapSelected){

              // If User to copy loaded, expand data

              if(oUserToCopy){

                this.getCompModel("FaraFormProperties").setProperty("/typeOfAccessSearchedValuesVisible", true);

              } else {

                this.getCompModel("FaraFormProperties").setProperty("/typeOfAccessSearchedValuesVisible", false);

              }
            }



            // If User requiring access loaded, expand data

            if(oUserRequiringAccess){

              this.getCompModel("FaraFormProperties").setProperty("/creatingAccessDataVisible", true);

            } else {

              this.getCompModel("FaraFormProperties").setProperty("/creatingAccessDataVisible", false);

            }



            this._checkSubmit();



            //Check cancel button visible - for ASL forms, it's only visible to the ASL team
            var bCancelVisible = false;
            var bCanEdit = false;
            // Rejected forms can be resubmitted
            var bCanResubmit = oFormModelData.status == "RE";

            if (oFormModelData.workItemId && oFormModelData.workItemId !== "000000000000") {
                bCancelVisible = true;

            }

            if (oFormModelData.workItemId && oFormModelData.workItemId !== "000000000000" && oFormModelData.status == "A2") {
                bCanEdit = true;
            }

            this.getCompModel("FaraFormProperties").setProperty("/cancelVisible", bCancelVisible);

            this.getCompModel("FaraFormProperties").setProperty("/canEdit", bCanEdit);

            this.getCompModel("FaraFormProperties").setProperty("/canResubmit", bCanResubmit);


            this.switchOffBusy();



            if(oFormModelData.status !== "CO") {

              jQuery.sap.delayedCall("100", this, function() {

                  this.switchOnBusy();

                  //Remove Select All Tokens

                  if (this.byId("aslAuthCostCentersMultiComboBox") != undefined) 
                    this._invisibleSelectAllToken(this.byId("aslAuthCostCentersMultiComboBox")._oTokenizer.getTokens());

                  if (this.byId("expencesCostCentersMultiComboBox") != undefined) 
                    this._invisibleSelectAllToken(this.byId("expencesCostCentersMultiComboBox")._oTokenizer.getTokens());

                  if (this.byId("ecsCostCentersMultiComboBox") != undefined) 
                    this._invisibleSelectAllToken(this.byId("ecsCostCentersMultiComboBox")._oTokenizer.getTokens());

                  if (this.byId("cmsCostCentersMultiComboBox") != undefined) 
                    this._invisibleSelectAllToken(this.byId("cmsCostCentersMultiComboBox")._oTokenizer.getTokens());



                  var sUser = null;

                  if(oFormModelData && oFormModelData.creatingAccess && oFormModelData.creatingAccess.userId) {

                    sUser = oFormModelData.creatingAccess.userId;

                  } else {

                    sUser = oCurrentUser.UserName;

                  }

                  var bAddNewTransaction = oFormModelData.typeAccess.addNewTransactionSelected;

                  this._initExistingRolesModel(sUser, bAddNewTransaction)

                    .then(function() {

                      this.switchOffBusy();

                    }.bind(this))

                    .catch(function() {

                      this.switchOffBusy();

                    }.bind(this));



                  // this.switchOffBusy();

              });

            }



            //Get approval history data

            var sStatusDesc;



            var aStatus = this.getCompModel("FormsStatus").getProperty("/formsStatus");

            for(var i = 0; i < aStatus.length && !sStatusDesc; i++){

              var oStatus = aStatus[i];

              if(oStatus.Status === oFormData.Status){

                sStatusDesc = oStatus.StatusDescription;

              }

            }





            var sSubtitle = this.getResourceBundleText("faraForm.ah.currentStatus", sStatusDesc);

            this.getModel("ApprovalHistoryModel").setProperty("/subtitle", sSubtitle);

            
            this.getModel("ApprovalHistoryModel").setProperty("/rejectionReason", oFormData.RejectionReason);



            var aLines = [];

            if(oFormData.L1ApprovedStatus){

              aLines.push({

                level: this.getResourceBundleText("faraForm.ah.level1"),

                status: oFormData.L1ApprovedStatusText,

                personApproved: oFormData.L1ApprovedBy,

                date: this.convertDate(oFormData.L1ApprovedOn, true)

              });



              if(oFormData.L2ApprovedStatus){

                aLines.push({

                  level: this.getResourceBundleText("faraForm.ah.level2"),

                  status: oFormData.L2ApprovedStatusText,

                  personApproved: oFormData.L2ApprovedBy,

                  date: this.convertDate(oFormData.L2ApprovedOn, true)

                });



                if(oFormData.L3ApprovedStatus){

                  aLines.push({

                    level: this.getResourceBundleText("faraForm.ah.level3"),

                    status: oFormData.L3ApprovedStatusText,

                    personApproved: oFormData.L3ApprovedBy,

                    date: this.convertDate(oFormData.L3ApprovedOn, true)

                  });

                }

              }

            }



            this.getModel("ApprovalHistoryModel").setProperty("/approvalHistory", aLines);

        },



        /**

         * Master data models initialization

         * @private

         * @param  {string} sFormId If for loading a form after initialize master data models

         */

        _initModels: function(sFormId){

            //A little delay just to let the rendering finish when acceding directly to FaraForm URL.

            jQuery.sap.delayedCall("100", this, function() {

                this.switchOnBusy();

                Promise.all([this._initExistingRolesModel(), this._initCodingGroupsModel(), this._initCurrentUserModel(), this._initAuthLevelsModel(), this._initDepartmentsModel()])

                    .then(function(aAllData){

                        this.switchOffBusy();

                        aAllData.forEach(function(oReturnedData){

                            if(oReturnedData){

                                switch(oReturnedData.id){

                                    case "Departments":

                                        if (this.byId("DepartmentSelect") != undefined) {
                                            this._sFirstDepartmentId = oReturnedData.first;

                                            this.byId("DepartmentSelect").fireChange({id: this._sFirstDepartmentId});

                                            this.getCompModel("FaraFormModel").setProperty("/cms/departmentSelected", this._sFirstDepartmentId);

                                        }
                                }

                            }

                        }.bind(this));

                        if(sFormId){

                            this._loadCostCenters(this.getCompModel("CurrentUserModel").getProperty("/UserName"), true)

                                .then(function(){

                                    this._loadForm(sFormId);

                                }.bind(this))

                                .catch(function() {



                                }.bind(this));

                        }

                    }.bind(this))

                    .catch(function(oError) {

                        if(oError && oError.response && oError.response.requestUri && oError.response.statusCode

                          && oError.response.statusText && oError.message) {

                            this.alert(

                                "faraForm.models.initError",

                                "E",

                                function(){this.switchOffBusy();}.bind(this),

                                [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]

                            );

                        } else {

                          // this.alert(

                          //     "faraForm.models.initErrorSimple",

                          //     "Simple-E",

                          //     function(){this.switchOffBusy();}.bind(this),

                          //     []

                          // );

                        }



                    }.bind(this));

            });

        },



        /**

         * Existing Roles initialization

         * @public

         */

        _initExistingRolesModel: function(sUserName, bTrans){

            return new Promise(function(resolve, reject){

                var aFilters = [];



                if(sUserName && bTrans !== undefined && bTrans !== null) {

                  var oUserNameFilter = new Filter({

                      path: "Filter/UserName",

                      operator: sap.ui.model.FilterOperator.EQ,

                      value1: sUserName

                  });

                  var oTransFilter = new Filter({

                      path: "Filter/Trans",

                      operator: sap.ui.model.FilterOperator.EQ,

                      value1: "" + bTrans

                  });

                  aFilters.push(oUserNameFilter, oTransFilter);

                }



                // if(this.getCompModel("ExistingRolesModel") &&

                //     (!this.getCompModel("ExistingRolesModel").getProperty("/roles") || this.getCompModel("ExistingRolesModel").getProperty("/roles").length === 0)){

                    var mParams = {

                        success: function(oData, result){

                            var aRoles = [];

                            var aRecoveredRoles = oData.results;

                            for(var i = 0; i < aRecoveredRoles.length; i++){

                                var oRole = aRecoveredRoles[i];

                                aRoles.push({id: oRole.RoleName, desc: (oRole.RoleDescription + " [" + oRole.RoleName+ "]")});

                            }

                            this.getCompModel("ExistingRolesModel").setSizeLimit(aRoles.length);

                            this.getCompModel("ExistingRolesModel").setProperty("/roles", aRoles);

                            return resolve();

                        }.bind(this),



                        error: function(oError){

                            return reject(oError);

                        }.bind(this),



                        filters: aFilters

                    };



                    this.getCompModel().read("RoleSet", mParams);

                // } else {

                //     return resolve();

                // }

            }.bind(this));

        },



        /**

         * Coding groups initialization

         * @public

         */

        _initCodingGroupsModel: function(){

            return new Promise(function(resolve, reject){

                if(this.getCompModel("CodingGroupsModel") &&

                    (!this.getCompModel("CodingGroupsModel").getProperty("/codingGroups") || this.getCompModel("CodingGroupsModel").getProperty("/codingGroups").length === 0)){

                    var mParams = {

                        success: function(oData, result){

                            var aCodingGroups = [];

                            var aRecoveredCodingGroups = oData.results;

                            for(var i = 0; i < aRecoveredCodingGroups.length; i++){

                                var oCodingGroup = aRecoveredCodingGroups[i];

                                aCodingGroups.push({id: oCodingGroup.APCodingGroupID, desc: oCodingGroup.APCodingGroupName});

                            }

                            this.getCompModel("CodingGroupsModel").setSizeLimit(aCodingGroups.length);

                            this.getCompModel("CodingGroupsModel").setProperty("/codingGroups", aCodingGroups);

                            return resolve();

                        }.bind(this),



                        error: function(oError){

                            return reject(oError);

                        }.bind(this)

                    };



                    this.getCompModel().read("APCodingGroupSet", mParams);

                } else {

                    return resolve();

                }

            }.bind(this));

        },



        /**

         * Coding auth levels initialization

         * @public

         */

        _initAuthLevelsModel: function(){

            return new Promise(function(resolve, reject){

                if(this.getCompModel("AuthLevelsModel") &&

                    (!this.getCompModel("AuthLevelsModel").getProperty("/levels") || this.getCompModel("AuthLevelsModel").getProperty("/levels").length === 0)){

                    var mParams = {

                        success: function(oData, result){

                            var aLevels = [];

                            var aRecoveredLevels = oData.results;

                            for(var i = 0; i < aRecoveredLevels.length; i++){

                                var oLevel = aRecoveredLevels[i];

                                aLevels.push({id: oLevel.ASLLevelID, desc: oLevel.ASLLevelName});

                            }

                            this.getCompModel("AuthLevelsModel").setSizeLimit(aLevels.length);

                            this.getCompModel("AuthLevelsModel").setProperty("/levels", aLevels);

                            return resolve();

                        }.bind(this),



                        error: function(oError){

                            return reject(oError);

                        }.bind(this)

                    };



                    this.getCompModel().read("ASLLevelSet", mParams);

                } else {

                    return resolve();

                }

            }.bind(this));

        },



        /**

         * Departments initialization

         * @public

         */

        _initDepartmentsModel: function(){

            return new Promise(function(resolve, reject){

                if(this.getCompModel("DepartmentsModel") &&

                    (!this.getCompModel("DepartmentsModel").getProperty("/departments") || this.getCompModel("DepartmentsModel").getProperty("/departments").length === 0)){

                    var mParams = {

                        success: function(oData, result){

                            var aDepartments = [];

                            var aRecoveredDepartments = oData.results;

                            for(var i = 0; i < aRecoveredDepartments.length; i++){

                                var oDepartment = aRecoveredDepartments[i];

                                aDepartments.push({id: oDepartment.DepartmentID, desc: oDepartment.DepartmentName});

                            }

                            this.getCompModel("DepartmentsModel").setSizeLimit(aDepartments.length);

                            this.getCompModel("DepartmentsModel").setProperty("/departments", aDepartments);

                            return resolve({id: "Departments", first: aDepartments[0].id});

                        }.bind(this),



                        error: function(oError){

                            return reject(oError);

                        }.bind(this)

                    };



                    this.getCompModel().read("DepartmentSet", mParams);

                } else {

                    return resolve();

                }

            }.bind(this));

        },



        /**

         * Recovers data of current logged user

         * @public

         */

        _initCurrentUserModel: function(){

            if(!this.getCompModel("user") || !this.getCompModel("user").oData.d.UserName){

              //  this.navTo("Login");

            }else {

                return new Promise(function (resolve, reject) {

                    if (this.getCompModel("CurrentUserModel")) {

                        var mParams = {

                            success: function (oData, result) {

                                var oUser = {

                                    UserName: oData.UserName,

                                    FullName: oData.FullName,

                                    JobTitle: oData.JobTitle,

                                    ManagerUserName: oData.ManagerUserName,

                                    ManagerFullName: oData.ManagerFullName,

                                    Department: oData.Department,

                                    CostCenter: oData.CostCenter,

                                    CostCenterName: oData.CostCenterName,

                                    IsEditorial: oData.IsEditorial ? true : false,

                                    Phone: oData.Phone,

                                    Email: oData.Email,

                                    HasSignature: oData.HasSignature ? true : false,

                                    HasASL: oData.HasASL ? true : false,

                                    ASLLevel: oData.ASLLevel,
                                    ASLCostCenters: oData.ASLCostCenter,
                                    ASLCanSelectCostCenterOtherDept: oData.CanSelectOtherDept,
                                    ASLCostCentersOtherDept: oData.ASLCostCenterOtherDept,
                                    ASLCanApproveDept: oData.CanApproveDept,
                                    ASLDepts: oData.ASLDept
                                };

                                this.getCompModel("CurrentUserModel").setData(oUser);

                                this.getCompModel("FaraFormModel").setProperty("/aslAuth/canSelectCostCenterOtherDept", oData.CanSelectOtherDept);

                                this.getCompModel("FaraFormModel").setProperty("/aslAuth/canApproveDept", oData.CanApproveDept);

                                this.getCompModel("FaraFormModel").setProperty("/aslAuth/costCentersKeys", (oData.ASLCostCenter || "").split(","));
                                this.getCompModel("FaraFormModel").setProperty("/aslAuth/costCentersOtherDeptKeys", (oData.ASLCostCenterOtherDept || "").split(","));
                                return resolve();

                            }.bind(this),



                            error: function (oError) {

                                return reject(oError);

                            }.bind(this)

                        };



                        this.getCompModel().read("UserSet('" + this.getCompModel("user").oData.d.UserName + "')", mParams);

                    } else {

                        return resolve();

                    }

                }.bind(this));

            }

        },



        /**

         * Recovers data of current logged user

         * @public

         */

        _searchUserData: function(sKey, sUserToSearch, bExpandRoleSet){

            return new Promise(function(resolve, reject){

                if(this.getCompModel("CurrentUserModel")){



                    var oUrlParams = {};

                    if(bExpandRoleSet){

                        oUrlParams = {"$expand": 'Roles'};

                    }



                    var mParams = {

                        success: function(oData, result){

                            var sUserRoles = "";



                            if(oData.Roles){

                                var aRoles = oData.Roles.results;

                                if(aRoles && aRoles.length > 0){

                                    aRoles.forEach(function(oRole){

                                        if(sUserRoles){

                                            sUserRoles += ",";

                                        }



                                        sUserRoles += oRole.RoleName;

                                    }.bind(this));

                                }

                            }



                            this.getCompModel("FaraFormModel").setProperty("/typeAccess/roles", sUserRoles);



                            var oUser = {

                                UserName: oData.UserName,

                                FullName: oData.FullName,

                                JobTitle: oData.JobTitle,

                                ManagerUserName: oData.ManagerUserName,

                                ManagerFullName: oData.ManagerFullName,

                                Department: oData.Department,

                                CostCenter: oData.CostCenter,

                                CostCenterName: oData.CostCenterName,

                                IsEditorial: oData.IsEditorial,

                                Phone: oData.Phone,

                                Email: oData.Email,

                                HasSignature: oData.HasSignature ? true : false,

                                HasASL: oData.HasASL ? true : false,

                                ASLLevel: oData.ASLLevel,
                                Roles: sUserRoles,
                                ASLCostCenters: oData.ASLCostCenter,
                                ASLCostCentersOtherDept: oData.ASLCostCenterOtherDept,
                                ASLDepts: oData.ASLDept
                            };

                            return resolve({key: sKey, user: oUser});

                        }.bind(this),



                        error: function(oError){

                            return reject(oError);

                        }.bind(this),



                        urlParameters: oUrlParams

                    };



                    this.getCompModel().read("UserSet('" + sUserToSearch + "')", mParams);

                } else {

                    return resolve();

                }

            }.bind(this));

        },



        /**

         * Loads Form from ID making a read to the entity

         * @private

         * @param {string} sFormID Form ID

         * @param {boolean} bUnSwitchOff Boolean for switch off busy or don't, just to don't turn it off on load form case

         */

        _loadFormFromID: function(sFormID, bUnSwitchOff){

            return new Promise(function(resolve, reject){

                var mParams = {

                    success: function(oData, result){

                        return resolve(oData);

                    }.bind(this),



                    error: function(oError){

                        this.alert(

                            "faraForm.models.readFormError",

                            "E",

                            function(){this.switchOffBusy(); return reject();}.bind(this),

                            [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]

                        );

                    }.bind(this),

                };



                this.switchOnBusy();



                this.getCompModel().read("FARAFormSet('" + sFormID + "')", mParams);

            }.bind(this));

        },



        /**

         * Loads Cost Centers filtering by a given user during form creation. Filtering does not happen at any
         * other time as doing so causes the cost centre not to be displayed during approval.
         * @private

         * @param {string} sUserName User Name (ID)

         * @param {boolean} bUnSwitchOff Boolean for switch off busy or don't, just to don't turn it off on load form case

         * @returns {Promise} Promise fulfilled when cost centres have been read
         */

        _loadCostCenters: function(sUserName, bUnSwitchOff){

            return new Promise(function(resolve, reject){

                if(this.getCompModel("CostCentersModel")){

                    var bFilterCostCentres = this.getCompModel("FaraFormProperties").getProperty("/filterCostCentres");
                    if ((this.getModel("CurrentUrlModel").getProperty("/route") == "CreateFaraForm") || bFilterCostCentres) {
                        var oUserNameFilter = new Filter({

                            path: "Filter/UserName",

                            operator: sap.ui.model.FilterOperator.EQ,

                            value1: sUserName

                        });

                    } else {
                        var oUserNameFilter = new Filter({

                            path: "Filter/UserName",

                            operator: sap.ui.model.FilterOperator.EQ,

                            value1: ""

                        });

                    }


                    var mParams = {

                        success: function(oData, result){

                            var aCostCenters = [];

                            var aRecoveredCostCenters = oData.results;

                            for(var i = 0; i < aRecoveredCostCenters.length; i++){

                                var oCostCenter = aRecoveredCostCenters[i];

                                aCostCenters.push({id: oCostCenter.CostCenterNumber, desc: oCostCenter.CostCenterName});

                            }



                            aCostCenters.unshift({id: this.getConstant("selectAllKey"), desc: this.getResourceBundleText("selectAll")});



                            this.getCompModel("CostCentersModel").setSizeLimit(aCostCenters.length);

                            this.getCompModel("CostCentersModel").setProperty("/costCenters", aCostCenters);

                            if(!bUnSwitchOff){

                                this.switchOffBusy();

                            }

                            return resolve();

                        }.bind(this),



                        error: function(oError){

                            this.alert(

                                "faraForm.models.costCenterError",

                                "E",

                                function(){this.switchOffBusy(); return reject();}.bind(this),

                                [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]

                            );

                        }.bind(this),



                        filters: [oUserNameFilter]

                    };



                    this.switchOnBusy();

                    this.getCompModel().read("CostCenterSet", mParams);

                } else {

                    return resolve();

                }

            }.bind(this));

        },


         /**
          * Load cost centres from other departments that the user has access to.
          * For example, Sunday Times users may have access to select Times
          * cost centres. Those Times cost centres are fetched here.
          *
          * @private
          * @param {string} sUserName User Name (ID)
          * @param {boolean} bUnSwitchOff Turn off busy flag
          * @returns {Promise} Promise fulfilled when departments have been read
          * */
          _loadCostCentersOtherDepartment: function(sUserName, bUnSwitchOff) {
            return new Promise(function(resolve, reject) {
              if (this.getCompModel("CostCentersOtherDeptModel")) {
                let bFilterCostCentres = this.getCompModel("FaraFormProperties").getProperty("/filterCostCentres");
                if ((this.getModel("CurrentUrlModel").getProperty("/route") == "CreateFaraForm") || bFilterCostCentres) {
                  var oUserNameFilter = new Filter({
                    path: "Filter/UserName",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: sUserName
                  });
                } else {
                  var oUserNameFilter = new Filter({
                    path: "Filter/UserName",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: ""
                  });
                }
                const oOtherDeptFilter = new Filter({
                  path: "Filter/OtherDept",
                  operator: sap.ui.model.FilterOperator.EQ,
                  value1: true
                })

                const mParams = {
                  success: function(oData, result){
                    let aCostCenters = [];
                    let aRecoveredCostCenters = oData.results;
                      for (let i = 0; i < aRecoveredCostCenters.length; i++){
                        let oCostCenter = aRecoveredCostCenters[i];
                        aCostCenters.push({
                          id: oCostCenter.CostCenterNumber, 
                          desc: oCostCenter.CostCenterName,
                          deptName: oCostCenter.CostCenterDepartmentName
                        });
                      }

                      aCostCenters.unshift({
                        id: this.getConstant("selectAllKey"), 
                        desc: this.getResourceBundleText("selectAll"),
                        deptName: this.getResourceBundleText("selectAllGroup")
                      });

                      this.getCompModel("CostCentersOtherDeptModel").setSizeLimit(aCostCenters.length);
                      this.getCompModel("CostCentersOtherDeptModel").setProperty("/costCenters", aCostCenters);
                      if (!bUnSwitchOff){
                        this.switchOffBusy();
                      }
                      return resolve();
                  }.bind(this),
                  error: function(oError){
                    this.alert(
                      "faraForm.models.costCenterError",
                      "E",
                      function(){this.switchOffBusy(); return reject();}.bind(this),
                      [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]
                    );
                  }.bind(this),

                  filters: [oUserNameFilter, oOtherDeptFilter]
                };

                this.switchOnBusy();
                this.getCompModel().read("CostCenterSet", mParams);
              } else {
                return resolve();
              }
            }.bind(this));

        },

        /**
         * Load cost centre departments (these are taken from the cost centre hierarchy).
         *
         * @private
         * @param {string} sUserName User Name (ID)
         * @param {boolean} bUnSwitchOff Turn off busy flag
         * @returns {Promise} Promise fulfilled when departments have been read
         * */
        _loadCostCenterDepartments: function(sUserName, bUnSwitchOff) {
            return new Promise(function(resolve, reject) {
                if (this.getCompModel("CostCenterDeptsModel")){
                    var bFilterCostCentres = this.getCompModel("FaraFormProperties").getProperty("/filterCostCentres");
                    if ((this.getModel("CurrentUrlModel").getProperty("/route") == "CreateFaraForm") || bFilterCostCentres) {
                        var oUserNameFilter = new Filter({
                            path: "Filter/UserName",
                            operator: sap.ui.model.FilterOperator.EQ,
                            value1: sUserName
                        });
                    } else {
                        var oUserNameFilter = new Filter({
                            path: "Filter/UserName",
                            operator: sap.ui.model.FilterOperator.EQ,
                            value1: ""
                        });
                    }

                    const mParams = {
                        success: function(oData, result){
                            let aDepts = [];
                            let aRecoveredDepts = oData.results;
                            for (let i = 0; i < aRecoveredDepts.length; i++){
                                let oDept = aRecoveredDepts[i];
                                aDepts.push({id: oDept.DepartmentID, desc: oDept.DepartmentName});
                            }

                            aDepts.unshift({id: this.getConstant("selectAllKey"), desc: this.getResourceBundleText("selectAll")});

                            this.getCompModel("CostCenterDeptsModel").setSizeLimit(aDepts.length);
                            this.getCompModel("CostCenterDeptsModel").setProperty("/departments", aDepts);
                            if (!bUnSwitchOff){
                                this.switchOffBusy();
                            }
                            return resolve();
                        }.bind(this),

                        error: function(oError){
                            this.alert(
                                "faraForm.models.costCenterDeptError",
                                "E",
                                function(){this.switchOffBusy(); return reject();}.bind(this),
                                [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]
                            );
                        }.bind(this),


                        filters: [oUserNameFilter]
                    };


                    this.switchOnBusy();
                    this.getCompModel().read("CostCenterDepartmentSet", mParams);
                } else {
                    return resolve();
                }
            }.bind(this));
        },

        /**

         * Loads Cost Centers for publication, filtering by a given publication ID

         * @private

         * @param {string} sPubId Publication ID

         * @param {boolean} bUnSwitchOff Boolean for switch off busy or don't, just to don't turn it off on load form case

         */

        _loadPublicationCostCenters: function(sPubId, bUnSwitchOff){

            return new Promise(function(resolve, reject){

                if(this.getCompModel("PublicationCostCentersModel")){

                    var oUserNameFilter = new Filter({

                        path: "Filter/PublicationID",

                        operator: sap.ui.model.FilterOperator.EQ,

                        value1: sPubId

                    });



                    var mParams = {

                        success: function(oData, result){

                            var aCostCenters = [];

                            var aRecoveredCostCenters = oData.results;

                            for(var i = 0; i < aRecoveredCostCenters.length; i++){

                                var oCostCenter = aRecoveredCostCenters[i];

                                aCostCenters.push({id: oCostCenter.CostCenterNumber, desc: oCostCenter.CostCenterName});

                            }



                            aCostCenters.unshift({id: this.getConstant("selectAllKey"), desc: this.getResourceBundleText("selectAll")});



                            this.getCompModel("PublicationCostCentersModel").setSizeLimit(aCostCenters.length);

                            this.getCompModel("PublicationCostCentersModel").setProperty("/costCenters", aCostCenters);

                            if(!bUnSwitchOff){

                                this.switchOffBusy();

                            }

                            return resolve();

                        }.bind(this),



                        error: function(oError){

                            this.alert(

                                "faraForm.models.costCenterError",

                                "E",

                                function(){this.switchOffBusy(); return reject();}.bind(this),

                                [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]

                            );

                        }.bind(this),



                        filters: [oUserNameFilter]

                    };



                    this.switchOnBusy();

                    this.getCompModel().read("CostCenterSet", mParams);

                } else {

                    return resolve();

                }

            }.bind(this));

        },



        /**

         * Loads Cost Centers for CMS, filtering by a given department ID

         * @private

         * @param {string} sPubId Department ID

         * @param {boolean} bUnSwitchOff Boolean for switch off busy or don't, just to don't turn it off on load form case

         */

        _loadDepartmentCostCenters: function(sDepId, bUnSwitchOff){

            return new Promise(function(resolve, reject){

                if(this.getCompModel("DepartmentCostCentersModel")){

                    var oUserNameFilter = new Filter({

                        path: "Filter/DepartmentID",

                        operator: sap.ui.model.FilterOperator.EQ,

                        value1: sDepId

                    });



                    var mParams = {

                        success: function(oData, result){

                            var aCostCenters = [];

                            var aRecoveredCostCenters = oData.results;

                            for(var i = 0; i < aRecoveredCostCenters.length; i++){

                                var oCostCenter = aRecoveredCostCenters[i];

                                aCostCenters.push({id: oCostCenter.CostCenterNumber, desc: oCostCenter.CostCenterName});

                            }



                            aCostCenters.unshift({id: this.getConstant("selectAllKey"), desc: this.getResourceBundleText("selectAll")});



                            this.getCompModel("DepartmentCostCentersModel").setSizeLimit(aCostCenters.length);

                            this.getCompModel("DepartmentCostCentersModel").setProperty("/costCenters", aCostCenters);

                            if(!bUnSwitchOff){

                                this.switchOffBusy();

                            }

                            return resolve();

                        }.bind(this),



                        error: function(oError){

                            this.alert(

                                "faraForm.models.costCenterError",

                                "E",

                                function(){this.switchOffBusy(); return reject();}.bind(this),

                                [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]

                            );

                        }.bind(this),



                        filters: [oUserNameFilter]

                    };



                    this.switchOnBusy();

                    this.getCompModel().read("CostCenterSet", mParams);

                } else {

                    return resolve();

                }

            }.bind(this));

        },



        /**

         * Resets Who Requires Access selections

         * @private

         */

        _resetWhoRequiresAccessSelection: function(){

            this.getCompModel("FaraFormModel").setProperty("/whoRequiresForm/yourselfSelected", false);

            this.getCompModel("FaraFormModel").setProperty("/whoRequiresForm/someoneElseSelected", false);

        },



        /**

         * Resets Type of Access section

         * @private

         */

        _resetTypeOfAccessSection: function(){

            this.getCompModel("FaraFormModel").setProperty("/typeAccess/yesSelected", false);

            this.getCompModel("FaraFormModel").setProperty("/typeAccess/noSelected", false);

            this.getCompModel("FaraFormModel").setProperty("/typeAccess/addNewTransactionSelected", false);

            this.getCompModel("FaraFormModel").setProperty("/typeAccess/addNewRoleSelected", false);

        },



        /**

         * Loads data for your details

         * @private

         */

        _loadYourDetails: function(){

            var oUser = this.getCompModel("CurrentUserModel").getData();



            this.getCompModel("FaraFormModel").setProperty("/yourDetailsForm/name", oUser.FullName);

            this.getCompModel("FaraFormModel").setProperty("/yourDetailsForm/jobTitle", oUser.JobTitle);

            this.getCompModel("FaraFormModel").setProperty("/yourDetailsForm/department", oUser.Department);

            this.getCompModel("FaraFormModel").setProperty("/yourDetailsForm/homeCostCenter", oUser.CostCenter);

            this.getCompModel("FaraFormModel").setProperty("/yourDetailsForm/homeCostCenterName", oUser.CostCenterName);

            this.getCompModel("FaraFormModel").setProperty("/yourDetailsForm/isEditorial", oUser.IsEditorial);

            this.getCompModel("FaraFormModel").setProperty("/yourDetailsForm/manager", oUser.ManagerFullName);

            this.getCompModel("FaraFormModel").setProperty("/yourDetailsForm/phone", oUser.Phone);

            this.getCompModel("FaraFormModel").setProperty("/yourDetailsForm/mail", oUser.Email);

        },



        /**

         * Resets require access details

         * @private

         */

        _resetRequireAccess: function(){

            this.getCompModel("FaraFormModel").setProperty("/requireAccess/yesSelected", false);

            this.getCompModel("FaraFormModel").setProperty("/requireAccess/noSelected", false);

        },



        /**

         * Resets yourself details

         * @private

         */

        _resetYourDetails: function(){

            this.getCompModel("FaraFormModel").setProperty("/yourDetailsForm/name", "");

            this.getCompModel("FaraFormModel").setProperty("/yourDetailsForm/jobTitle", "");

            this.getCompModel("FaraFormModel").setProperty("/yourDetailsForm/department", "");

            this.getCompModel("FaraFormModel").setProperty("/yourDetailsForm/homeCostCenter", "");

            this.getCompModel("FaraFormModel").setProperty("/yourDetailsForm/homeCostCenterName", "");

            this.getCompModel("FaraFormModel").setProperty("/yourDetailsForm/isEditorial", false);

            this.getCompModel("FaraFormModel").setProperty("/yourDetailsForm/manager", "");

            this.getCompModel("FaraFormModel").setProperty("/yourDetailsForm/phone", "");

            this.getCompModel("FaraFormModel").setProperty("/yourDetailsForm/mail", "");

        },



        /**

         * Resets creating access details

         * @private

         */

        _resetCreatingAccessDetails: function(bResetCostCentres = false){

            this.getCompModel("FaraFormProperties").setProperty("/creatingAccessDataVisible", false);

            this._resetSomeoneElseDetails(bResetCostCentres);

        },



        /**

         * Resets someone else details

         * @private

         */

        _resetSomeoneElseDetails: function(bResetCostCentres = false){

            this.getCompModel("FaraFormModel").setProperty("/creatingAccess/userId", "");

            this.getCompModel("FaraFormModel").setProperty("/creatingAccess/name", "");

            this.getCompModel("FaraFormModel").setProperty("/creatingAccess/jobTitle", "");

            this.getCompModel("FaraFormModel").setProperty("/creatingAccess/department", "");

            this.getCompModel("FaraFormModel").setProperty("/creatingAccess/homeCostCenter", "");

            this.getCompModel("FaraFormModel").setProperty("/creatingAccess/homeCostCenterName", "");

            this.getCompModel("FaraFormModel").setProperty("/creatingAccess/manager", "");

            this.getCompModel("FaraFormModel").setProperty("/creatingAccess/phone", "");

            this.getCompModel("FaraFormModel").setProperty("/creatingAccess/mail", "");

            this.getCompModel("FaraFormModel").setProperty("/creatingAccess/magnifier", true);

            this.getCompModel("FaraFormModel").setProperty("/creatingAccess/magnifier", true);

            if (bResetCostCentres) {
              this.getCompModel("FaraFormModel").setProperty("/aslAuth/costCentersKeys", []);
              this.getCompModel("FaraFormModel").setProperty("/aslAuth/costCentersOtherDeptKeys", []);
              this.getCompModel("FaraFormModel").setProperty("/aslAuth/costCenterDeptsKeys", []);
            }
        },



        /**

         * Resets data for searched user

         * @private

         */

        _resetTypeAccessSearchedData: function(){

            // Values for selected user

            this.getCompModel("FaraFormModel").setProperty("/typeAccess/jobTitle", "");

            this.getCompModel("FaraFormModel").setProperty("/typeAccess/department", "");

            this.getCompModel("FaraFormModel").setProperty("/typeAccess/manager", "");



            // Fields with values for selected user

            this.getCompModel("FaraFormProperties").setProperty("/typeOfAccessSearchedValuesVisible", false);



            this._checkSubmit();

        },



        /**

         * Resets selected data from "no" option related sections in Type Access.

         * @private

         * @param  {Boolean} bResetSubmit Reset visibility of submit button

         */

        _resetTypeAccessNoSelectedAndRelated: function(bResetSubmit){

            // Add new Transaction and add new Role radio buttons from Type Access

            this.getCompModel("FaraFormModel").setProperty("/typeAccess/addNewTransactionSelected", false);

            this.getCompModel("FaraFormModel").setProperty("/typeAccess/addNewRoleSelected", false);



            // Remove selected items from Add New Transaction Multicombos

            this._resetAddNewTransaction();



            // Remove selected items from Add New Role Multicombo

            this._resetAddNewRole();



            // Yes and No radio buttons from Other Financial Systems

            // It won't be neccesary for read operatives, probably we'll delete this on future

            // this.getCompModel("FaraFormModel").setProperty("/otherFinancialSystems/yesSelected", false);

            // this.getCompModel("FaraFormModel").setProperty("/otherFinancialSystems/noSelected", false);



            if(bResetSubmit){

                // Submit button

                this.getCompModel("FaraFormProperties").setProperty("/submitVisible", false);

            }

        },



        /**

         * Resets data from Add New Transaction Section.

         * @private

         */

        _resetAddNewTransaction: function(){

            // Remove selected items from Add New Transaction Multicombos

            var oTransactionsMultiInput = this.byId("transactionsMultiInput");

            oTransactionsMultiInput.destroyTokens();

            this.getCompModel("FaraFormModel").setProperty("/newTransaction/rolesKeys", []);

        },



        /**

         * Resets data from Add New Role.

         * @private

         */

        _resetAddNewRole: function(){

            // Remove selected items from Add New Role Multicombo

            this.getCompModel("FaraFormModel").setProperty("/newRole/rolesKeys", []);

        },



        /**

         * Resets data from ASL auth section (from selecting No on Type of access section).

         * @private

         * @param  {Boolean} bResetSubmit Reset visibility of submit button

         */

        _resetASLAuth: function(){

            // ASL auth radiobuttons

            this.getCompModel("FaraFormModel").setProperty("/aslAuth/levelSelected", "");
            this.getCompModel("FaraFormModel").setProperty("/aslAuth/invoicesYesSelected", false);

            this.getCompModel("FaraFormModel").setProperty("/aslAuth/approveDeptYesSelected", false);

            this.getCompModel("FaraFormModel").setProperty("/aslAuth/approveDeptNoSelected", false);

            // this.getCompModel("FaraFormModel").setProperty("/aslAuth/coderYesSelected", false);

            // ASL auth Multicombos

            this.getCompModel("FaraFormModel").setProperty("/aslAuth/costCentersKeys", []);

            this.getCompModel("FaraFormModel").setProperty("/aslAuth/approverCodingGroupsKeys", []);

            // this.getCompModel("FaraFormModel").setProperty("/aslAuth/coderCodingGroupsKeys", []);

        },



        /**
          * Resets fields for cost centres in other departments
          * @private
          *
          * */
        _resetCostCentresOtherDept: function() {
            this.getCompModel("FaraFormModel").setProperty("/aslAuth/canSelectCostCenterOtherDept", false);
            this.getCompModel("FaraFormModel").setProperty("/aslAuth/costCenterOtherDeptYesSelected", false);
            this.getCompModel("FaraFormModel").setProperty("/aslAuth/costCenterOtherDeptNoSelected", false);
            this.getCompModel("FaraFormModel").setProperty("/aslAuth/costCentersOtherDeptKeys", []);
        },

        /**
          * Resets fields for cost centre department approval
          * @private
          *
          * */
        _resetCostCentreDepts: function() {
            this.getCompModel("FaraFormModel").setProperty("/aslAuth/canApproveDept", false);
            this.getCompModel("FaraFormModel").setProperty("/aslAuth/approveDeptYesSelected", false);
            this.getCompModel("FaraFormModel").setProperty("/aslAuth/approveDeptNoSelected", false);
            this.getCompModel("FaraFormModel").setProperty("/aslAuth/costCenterDeptsKeys", []);
        },

        /**

         * Resets data from "yes" option related sections in ther Financial Systems.

         * @private

         * @param  {Boolean} bResetSubmit Reset visibility of submit button

         */

        _resetOtherFinancialSystemsSubsections: function(bResetSubmit){

            // Invoice Coding Group

            this._resetInvoiceCodingGroup(true);



            // Expences

            this._resetExpences(true);



            // SRM

            this._resetSRM(true);



            // Stock Approval radiobuttons

            this._resetStockApproval(true);



            // ECS

            this._resetECS(true);



            // CMS

            this._resetCMS(true);



            if(bResetSubmit){

                // Submit button

                this.getCompModel("FaraFormProperties").setProperty("/submitVisible", false);

            }

        },



        /**

         * Resets data from Invoice Coding Group.

         * @private

         * @param  {Boolean} bResetYes Reset also yes button

         */

        _resetInvoiceCodingGroup: function(bResetYes){

            // Expences radiobuttons

            if(bResetYes){

                this.getCompModel("FaraFormModel").setProperty("/codingGroup/yesSelected", false);

            }

            // Expences Multicombo

            this.getCompModel("FaraFormModel").setProperty("/codingGroup/coderCodingGroupsKeys", []);

        },



        /**

         * Resets data from expences.

         * @private

         * @param  {Boolean} bResetYes Reset also yes button

         */

        _resetExpences: function(bResetYes){

            // Expences radiobuttons

            if(bResetYes){

                this.getCompModel("FaraFormModel").setProperty("/expences/yesSelected", false);

            }

            this.getCompModel("FaraFormModel").setProperty("/expences/approverSelected", false);

            this.getCompModel("FaraFormModel").setProperty("/expences/validatorSelected", false);

            // Expences Multicombo

            this.getCompModel("FaraFormModel").setProperty("/expences/costCentersKeys", []);

        },



        /**

         * Resets data from SRM.

         * @private

         * @param  {Boolean} bResetSubmit Reset also yes button

         */

        _resetSRM: function(bResetYes){

            // SRM radiobuttons

            if(bResetYes){

                this.getCompModel("FaraFormModel").setProperty("/srm/yesSelected", false);

            }

            this.getCompModel("FaraFormModel").setProperty("/srm/buyerSelected", false);

            this.getCompModel("FaraFormModel").setProperty("/srm/approverSelected", false);

        },



        /**

         * Resets data from Stock Approval.

         * @private

         * @param  {Boolean} bResetSubmit Reset also yes button

         */

        _resetStockApproval: function(bResetYes){

            // Stock Approval radiobuttons

            if(bResetYes){

                this.getCompModel("FaraFormModel").setProperty("/stockApproval/yesSelected", false);

            }

            this.getCompModel("FaraFormModel").setProperty("/stockApproval/productionPucharseSelected", false);

            this.getCompModel("FaraFormModel").setProperty("/stockApproval/productionMRPSelected", false);

        },



        /**

         * Resets data from ECS.

         * @private

         * @param  {Boolean} bResetSubmit Reset also yes button

         */

        _resetECS: function(bResetYes){

            // ECS radiobuttons

            if(bResetYes){

                this.getCompModel("FaraFormModel").setProperty("/ecs/yesSelected", false);

            }

            this.getCompModel("FaraFormModel").setProperty("/ecs/comissioningEditorSelected", false);

            this.getCompModel("FaraFormModel").setProperty("/ecs/deskAdministratorSelected", false);

            this.getCompModel("FaraFormModel").setProperty("/ecs/deskHeadApproverSelected", false);

            this.getCompModel("FaraFormModel").setProperty("/ecs/contributionsCoordinatorSelected", false);

            this.getCompModel("FaraFormModel").setProperty("/ecs/managingEditorSelected", false);

            this.getCompModel("FaraFormModel").setProperty("/ecs/theTimesSelected", false);

            this.getCompModel("FaraFormModel").setProperty("/ecs/theSundayTimesSelected", false);

            this.getCompModel("FaraFormModel").setProperty("/ecs/theSunSelected", false);

            // ECS Multicombo

            this.getCompModel("FaraFormModel").setProperty("/ecs/costCentersKeys", []);

        },



        /**

         * Resets data from CMS.

         * @private

         * @param  {Boolean} bResetSubmit Reset also yes button

         */

        _resetCMS: function(bResetYes){

            // CMS radiobuttons

            if(bResetYes){

                this.getCompModel("FaraFormModel").setProperty("/cms/yesSelected", false);

            }

            this.getCompModel("FaraFormModel").setProperty("/cms/deskHeadSelected", false);

            this.getCompModel("FaraFormModel").setProperty("/cms/regionalApproverSelected", false);

            this.getCompModel("FaraFormModel").setProperty("/cms/managingEditorSelected", false);

            // CMS Multicombo

            this.getCompModel("FaraFormModel").setProperty("/cms/costCentersKeys", []);

        },



        /**

         * Checks submit visibility.

         * @private

         */

        _checkSubmit: function(){

            if(this.getCompModel("FaraFormModel").getProperty("/status") === null || this.getCompModel("FaraFormModel").getProperty("/workItemId") !== "000000000000"){

                if(this.getCompModel("FaraFormModel").getProperty("/areaRequestForm/sapSelected") && this.getCompModel("FaraFormModel").getProperty("/whoRequiresForm/yourselfSelected")){

                    this._checkSubmitSAPYourself();

                }else if(this.getCompModel("FaraFormModel").getProperty("/areaRequestForm/sapSelected") && this.getCompModel("FaraFormModel").getProperty("/whoRequiresForm/someoneElseSelected")){

                    this._checkSubmitSAPSomeoneElse();

                }else if(this.getCompModel("FaraFormModel").getProperty("/areaRequestForm/approvedSignatureSelected")){

                    this._checkSubmitApprovedSignature();

                }

            } else {

                this.getCompModel("FaraFormProperties").setProperty("/submitVisible", false);

            }

        },



        /**

         * for SAP - Yourself flow, checks if submit must be shown.

         * @private

         */

        _checkSubmitSAPYourself: function(){

            // Cases that show submit:

            // - Other Financial Yes && Require Access No

            // - Other Financial Yes/No && Require Access Yes && Would you like to copy someones access profile? No && Add a new transaction to an existing role/Add a new role to an existing user

            // - Other Financial Yes/No && Require Access Yes && Would you like to copy someones access profile? Yes && typeOfAccessSearchedValueVisible true

            var bOtherFinancialYes = this.getCompModel("FaraFormModel").getProperty("/otherFinancialSystems/yesSelected");

            var bOtherFinancialNo = this.getCompModel("FaraFormModel").getProperty("/otherFinancialSystems/noSelected");

            var bRequireAccessYes = this.getCompModel("FaraFormModel").getProperty("/requireAccess/yesSelected");

            var bRequireAccessNo = this.getCompModel("FaraFormModel").getProperty("/requireAccess/noSelected");

            var bTypeAccessNo = this.getCompModel("FaraFormModel").getProperty("/typeAccess/noSelected");

            var bTypeAccessYes = this.getCompModel("FaraFormModel").getProperty("/typeAccess/yesSelected");

            var bAddNewTransaction = this.getCompModel("FaraFormModel").getProperty("/typeAccess/addNewTransactionSelected");

            var bAddNewRole = this.getCompModel("FaraFormModel").getProperty("/typeAccess/addNewRoleSelected");

            var bTypeOfAccesSearched = this.getCompModel("FaraFormProperties").getProperty("/typeOfAccessSearchedValuesVisible");


            bRequireAccessNo = true; // Added when role assignment moved to GRC
            var bSubmitVisible = false;

            if(

                (bOtherFinancialYes && bRequireAccessNo)

                ||

                ((bOtherFinancialYes || bOtherFinancialNo) && bRequireAccessYes && bTypeAccessNo && (bAddNewTransaction || bAddNewRole))

                ||

                ((bOtherFinancialYes || bOtherFinancialNo) && bRequireAccessYes && bTypeAccessYes && bTypeOfAccesSearched)

            ){

                bSubmitVisible = true;

            }

                
            this.getCompModel("FaraFormProperties").setProperty("/submitVisible", bSubmitVisible);

        },



        /**

         * for SAP - Someone Else flow, checks if submit must be shown.

         * @private

         */

        _checkSubmitSAPSomeoneElse: function(){

            // Cases that show submit:

            // - Require Access No && searched and selected user

            // - Require Access Yes && Would you like to copy someones access profile? No && Add a new transaction to an existing role/Add a new role to an existing user && searched and selected user

            // - Require Access Yes && Would you like to copy someones access profile? Yes && searched and selected user && searched and selected user to copy

            var bRequireAccessYes = this.getCompModel("FaraFormModel").getProperty("/requireAccess/yesSelected");

            var bRequireAccessNo = this.getCompModel("FaraFormModel").getProperty("/requireAccess/noSelected");

            var bTypeAccessNo = this.getCompModel("FaraFormModel").getProperty("/typeAccess/noSelected");

            var bTypeAccessYes = this.getCompModel("FaraFormModel").getProperty("/typeAccess/yesSelected");

            var bAddNewTransaction = this.getCompModel("FaraFormModel").getProperty("/typeAccess/addNewTransactionSelected");

            var bAddNewRole = this.getCompModel("FaraFormModel").getProperty("/typeAccess/addNewRoleSelected");

            var bSearchedVisible = this.getCompModel("FaraFormProperties").getProperty("/typeOfAccessSearchedValuesVisible");

            var bDataVisible = this.getCompModel("FaraFormProperties").getProperty("/creatingAccessDataVisible");



            bRequireAccessNo = true; // Added when role assignment moved to GRC

            var bSubmitVisible = false;

            if(

                (bRequireAccessNo && bDataVisible)

                ||

                (bRequireAccessYes && bTypeAccessNo && (bAddNewTransaction || bAddNewRole)) && bDataVisible

                ||

                bRequireAccessYes && bTypeAccessYes && bDataVisible && bSearchedVisible

            ){

                bSubmitVisible = true;

            }



            this.getCompModel("FaraFormProperties").setProperty("/submitVisible", bSubmitVisible);

        },



        /**

         * For ASL flow, checks if submit must be shown.

         * @private

         */

        _checkSubmitApprovedSignature: function(){

            // Cases that show submit:

            // - Old: Other Financial Systems any selection, but one of both selected.

            // - New: We always show the button
            // var bOtherFinancialYes = this.getCompModel("FaraFormModel").getProperty("/otherFinancialSystems/yesSelected");

            // var bOtherFinancialNo = this.getCompModel("FaraFormModel").getProperty("/otherFinancialSystems/noSelected");



            // var bSubmitVisible = bOtherFinancialYes || bOtherFinancialNo;

            
            var bSubmitVisible = false;
            var hasASL = this.getCompModel("CurrentUserModel").getProperty("/HasASL");
            if (hasASL == undefined) {
                hasASL = false;
            }
            
            var bCheckApproveInvoices = this.getCompModel("FaraFormModel").getProperty("/aslAuth/invoicesYesSelected");

            var aSelectedASLAuthCostCenters = this.getCompModel("FaraFormModel").getProperty("/aslAuth/costCentersKeys");

            var aSelectedASLAuthApproverCodingGroups = this.getCompModel("FaraFormModel").getProperty("/aslAuth/approverCodingGroupsKeys");

            var bInvoiceApprovalComplete = bCheckApproveInvoices && (aSelectedASLAuthApproverCodingGroups.length > 0);

            var bASLApprovalComplete = aSelectedASLAuthCostCenters.length > 0;

            //var bSubmitVisible = bInvoiceApprovalComplete || bASLApprovalComplete;
            var bSubmitVisible = true;
            this.getCompModel("FaraFormProperties").setProperty("/submitVisible", bSubmitVisible);

        },



        /**

         * Check mandatory fields

         * @private

         */

        _checkMandatory: function(){

            var oReturnObject = {ok: true, errorMsg: ""};

            if (oReturnObject.ok && this.getCompModel("FaraFormModel").getProperty("/areaRequestForm/approvedSignatureSelected", false)) {

                oReturnObject = this._checkMandatoryApprovedSignature();

            } 
            if (oReturnObject.ok && this.getCompModel("FaraFormModel").getProperty("/areaRequestForm/sapSelected", false)) {

                oReturnObject = this._checkMandatorySAP();

            } 
            if (oReturnObject.ok && this.getCompModel("FaraFormModel").getProperty("/ecs/yesSelected", false)) {

                oReturnObject = this._checkMandatoryECS();

            } 
            if (oReturnObject.ok && this.getCompModel("FaraFormModel").getProperty("/cms/yesSelected", false)) {

                oReturnObject = this._checkMandatoryCMS();

            }



            return oReturnObject;

        },



        /**

         * Check mandatory fields for ASL flow

         * @private

         */

        _checkMandatoryApprovedSignature: function(){

            // Checkable fields

            var bYourselfSelected = this.getCompModel("FaraFormModel").getProperty("/whoRequiresForm/yourselfSelected");
            var bCheckApproveInvoices = this.getCompModel("FaraFormModel").getProperty("/aslAuth/invoicesYesSelected");

            var sNewASLLevel = this.getCompModel("FaraFormModel").getProperty("/aslAuth/levelSelected");
            // var bCheckCoderInvoices = this.getCompModel("FaraFormModel").getProperty("/aslAuth/coderYesSelected");


            // Already on the ASL?
            var bHasASL;
            var sCurrASLLevel;
            var sUserId;
            if (bYourselfSelected) {
              bHasASL = this.getCompModel("CurrentUserModel").getProperty("/HasASL");
              sCurrASLLevel = this.getCompModel("CurrentUserModel").getProperty("/ASLLevel");
            } else {
              bHasASL = this.getCompModel("FaraFormModel").getProperty("/creatingAccess/hasASL");
              sCurrASLLevel = this.getCompModel("FaraFormModel").getProperty("/creatingAccess/aslLevel");
              sUserId = this.getCompModel("FaraFormModel").getProperty("/creatingAccess/userId");
            }
            if (bHasASL == undefined) {
                bHasASL = false;
            }

            var bIsAslLevelChange = bHasASL && (sCurrASLLevel != sNewASLLevel);

                

            // Checkable MultiCombos

            // ASL Type of Access MultiCombos

            var aSelectedASLAuthCostCenters = this.getCompModel("FaraFormModel").getProperty("/aslAuth/costCentersKeys");

            var aSelectedASLAuthApproverCodingGroups = this.getCompModel("FaraFormModel").getProperty("/aslAuth/approverCodingGroupsKeys");

            // var aSelectedASLAuthCoderCodiingGroups = this.getCompModel("FaraFormModel").getProperty("/aslAuth/coderCodingGroupsKeys");



            var sErrorMessage;


            // If submitting for someone else, must have selected them
            if (!bYourselfSelected && !sUserId) {
                sErrorMessage = "faraForm.submit.checkerror.enterUser";

            } else 
            // If not on the ASL, check one cost center is selected

            if (!bHasASL && aSelectedASLAuthCostCenters.length < 1) {

                sErrorMessage = "faraForm.submit.checkerror.oneCostCenter";

            } else
            // Already on the ASL - must either change level, add new cost centres or select approve invoices
            if (bHasASL && aSelectedASLAuthCostCenters.length < 1 && !bCheckApproveInvoices && !bIsAslLevelChange) {
                sErrorMessage = "faraForm.submit.checkerror.aslMemberNoAdditionalCostCentre";

            } else
            // If Check Approve Invoices is selected, there must be at least one coding group selected

            if (bCheckApproveInvoices && aSelectedASLAuthApproverCodingGroups.length < 1) {

                sErrorMessage = "faraForm.submit.checkerror.approveInvoicesCodiingGroup";

            }
            // If Check Coder is selected, there must be at least one coding group selected

            // if(bCheckCoderInvoices && aSelectedASLAuthCoderCodiingGroups.length < 1){

            // 	sErrorMessage = "faraForm.submit.checkerror.coderCodiingGroup";

            // } else



            return {ok: sErrorMessage ? false : true, errorMsg: sErrorMessage};

        },



        /**

         * Check mandatory fields for SAP

         * @private

         */

        _checkMandatorySAP: function(){

            // Checkable fields

            var bYourselfSelected = this.getCompModel("FaraFormModel").getProperty("/whoRequiresForm/yourselfSelected");

            var bAccessOtherFinancial = this.getCompModel("FaraFormModel").getProperty("/otherFinancialSystems/yesSelected");

            var bInvoiceCodingGroups = this.getCompModel("FaraFormModel").getProperty("/codingGroup/yesSelected");

            var aSelectedCodingGroups = this.getCompModel("FaraFormModel").getProperty("/codingGroup/coderCodingGroupsKeys");


            var sErrorMessage;


            if (!bAccessOtherFinancial || !bInvoiceCodingGroups || aSelectedCodingGroups.length < 1) {
                sErrorMessage = "faraForm.submit.checkerror.invoiceCoding";

            }

            return {ok: sErrorMessage ? false : true, errorMsg: sErrorMessage};

        },
                

        /**

         * Check mandatory fields for ECS

         * @private

         */

        _checkMandatoryECS: function(){

            var aCostCentersKeys = this.getCompModel("FaraFormModel").getProperty("/ecs/costCentersKeys");



            var sErrorMessage;



            // If Check Approve Invoices is selected, there must be at least one coding group selected

            if(aCostCentersKeys.length < 1){

                sErrorMessage = "faraForm.submit.checkerror.ecsCostCenter";

            }



            return {ok: sErrorMessage ? false : true, errorMsg: sErrorMessage};

        },



        /**

         * Check mandatory fields for CMS

         * @private

         */

        _checkMandatoryCMS: function(){

            var aCostCentersKeys = this.getCompModel("FaraFormModel").getProperty("/cms/costCentersKeys");



            var sErrorMessage;



            // If Check Approve Invoices is selected, there must be at least one coding group selected

            if(aCostCentersKeys.length < 1){

                sErrorMessage = "faraForm.submit.checkerror.cmsCostCenter";

            }



            return {ok: sErrorMessage ? false : true, errorMsg: sErrorMessage};

        },



        /**

         * Remove selected all key

         * @private

         * @param {array} aArray array of elements

         */

        _purgeSelectedAll: function(aArray) {

            if (!aArray) {
                return;
            }
            var iSelectedAllIndex = aArray.indexOf(this.getConstant("selectAllKey"));

            if (iSelectedAllIndex > -1) {

                aArray.splice(iSelectedAllIndex, 1);

            }

            return aArray;

        },



        _FIWorkItemId: function(sFormID){

            return new Promise(function(resolve, reject){

                var mParams = {

                    urlParameters: {

                        "FormId" : sFormID,

                        "CurrentUser": this.getCompModel("user").oData.d.UserName

                    },

                    success: function(oData, result){

                        return resolve(oData);

                    }.bind(this),



                    error: function(oError){

                        this.alert(

                            "faraForm.models.readFormError",

                            "E",

                            function(){this.switchOffBusy(); return reject();}.bind(this),

                            [oError.response.requestUri, oError.response.statusCode, oError.response.statusText, oError.message]

                        );

                    }.bind(this),

                };



                this.getCompModel().callFunction("CheckWorkitem", mParams);

            }.bind(this));

        },



    });



});

