var Runner = {

	initialize: function() {

		//App loading
		sap.ui.getCore().attachInit(function() {
			sap.ui.require([
				"sap/m/Shell",
				"sap/ui/core/ComponentContainer"
			], function(Shell, ComponentContainer) {
				new Shell({
					app: new ComponentContainer({
						name: "news.uk.fara",
						height: "100%"
					})
				}).placeAt("root");
			});
		});

	}

};

//Run initialization
Runner.initialize();
