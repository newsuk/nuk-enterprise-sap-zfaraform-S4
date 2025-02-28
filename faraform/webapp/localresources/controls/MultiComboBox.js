sap.ui.define(
    ['sap/m/MultiComboBox'],
    function(MultiComboBox) {
        return MultiComboBox.extend("news.uk.fara.localresources.controls.MultiComboBox",{
            metadata: {
            },

            renderer: function(oRm,oControl){
              sap.m.MultiComboBoxRenderer.render(oRm,oControl); //use supercass renderer routine
            },
            _getItemsStartingText: function(sText, bInput){
              var aItems = [],
                selectableItems = bInput ? this.getEnabledItems() : this.getSelectableItems();

              selectableItems.forEach(function(oItem) {

                if (oItem.getText().toUpperCase().indexOf(sText.toUpperCase())>-1) {
                  aItems.push(oItem);
                }

              }, this);
              return aItems;
            },

            filterItems: function (aItems, sValue) {
              aItems.forEach(function(oItem) {
                var bMatch = oItem.getText().toUpperCase().indexOf(sValue.toUpperCase()) > -1;

                if (sValue === "") {
                  bMatch = true;
                  if (!this.bOpenedByKeyboardOrButton) {
                    // prevent filtering of the picker if it will be closed
                    return;
                  }
                }

                var oListItem = this.getListItem(oItem);

                if (oListItem) {
                  oListItem.setVisible(bMatch);
                }
              }, this);
            }
        });
    }
);
