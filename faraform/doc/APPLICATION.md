FARA Form Application
=====================

Overview
--------
The application follows the standard UI5/Gateway approach. UI components are defined in
XML views

Functionality
-------------
The form was originally developed to support the following:  
1. Adding people to the ASL
2. Adding codes to invoice coders
3. Adding coding groups to invoice approvers

Disable Functionality
---------------------

The following functionality has been delivered but is currently disabled:
1. Ability to add SAP ECC and SRM roles to users. This is now done via ARM in GRC.  
2. 

It has been disabled purely by commenting out the appropriate sections of the views (primarily `FARAForm.view.xml`).

Workflow
--------
The only approval currently enabled is for ASL requests. When a submission for ASL access is made, it goes 
to the following approvers:
1. Submitter's line manager.  
2. ASL team, who are able to make changes to the form.  
3. Group financial controller. 
After final approval, changes are made to the ASL (visible within transaction `ZASL`).

Approval is configured in table `ZFARA_APPROVERS`
![FARA Approvers](FARA_Approvers.png?raw=true)

Form Status
-----------
A form 
