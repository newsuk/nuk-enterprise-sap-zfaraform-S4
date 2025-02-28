# News UK FARA Form

This is the source for the News UK FARA form web application. It uses SAPUI5 for the presentation
layer and talks to several oData APIs exposed by SAP ECC.

Repo URL: https://github.com/newsuk/enterprise-sap-faraform

Code conventions
----------------
- UI5 is used from the SAP CDN  
- Use XML views  
- Texts are stored in properties files  
- TBC  

URLs
----
The application updates the respective SAP ECC backend system (see ICF aliases
`/fara` and `/fara_api`). The application is exposed externally via Netscaler reverse proxy. 

Public URLs:  
Development (ECD): https://faraformsdev.news.co.uk/fara/index.html  
Test (ECT): https://faraformsqas.news.co.uk/fara/index.html  
Production (ECP): https://faraforms.news.co.uk/fara/index.html  

Issue log
---------
Issues are tracked in the [issue log](https://docs.google.com/spreadsheets/d/15E3v0sGTcoEQfLNLwo_AagZjdWTfc0NiVnLPNDTFAa8/edit#gid=0).

Releases
--------
The following major releases are tagged:  
`v1.0` Initial import from Keytree git repo dump   
`v1.1` Various News UK fixes  
`v1.2` Disable all but ASL, invoice approval and coding. Various fixes.  
`v1.3` Primarily bug fixes. Release delivered for business UAT.  
`v1.4` Add ability to resubmit forms after rejections.  
`v1.5` Add authentication to API calls.   
`v1.6` Add ability to submit ASL forms "on behalf of" someone else.   

Deployment
----------
Building:  
1. `$ gulp build`  
Runtime artifacts are stored in `dist/*`

Deploying:  
1.  Copy `deploy.js` to `mydeploy.js` (`mydeploy.js` is not version controlled)  
2.  Provide ECC login credentials in `mydeploy.js`  
3. `$ gulp mydeploy`  

Deployment uploads the application to the ECD ABAP repository, updating the FARA BSP application `ZFARA_FORM`. Changes are promoted 
through the SAP landscape via the transport system.

General Notes
-------------
- Files contain a mix of carriage returns and linefeeds. Ideally update using linefeeds only  
- Build and deployment on Windows system has not been tested - it may be problematic
and very possibly will not work due to the use of `node.js`. A Mac or Linux VM is recommended.  

ABAP Code
---------
All ABAP code is in the `ZFARA` package in ECC.

