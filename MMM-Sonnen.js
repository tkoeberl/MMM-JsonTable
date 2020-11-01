'use strict';

Module.register("MMM-Sonnen", {

	jsonData: null,

	// Default module config.
	defaults: {
		url: "",
		header: "Battery",
		updateInterval: 10000,
		values: [["USOC","User state of charge:","%"],["Production_W","PV Production in watts:","W"],["Consumption_W","House comsumption:","W"]]

	},

	start: function () {
		this.getJson();
		this.scheduleUpdate();
	},

	scheduleUpdate: function () {
		var self = this;
		setInterval(function () {
			self.getJson();
		}, this.config.updateInterval);
	},

	// Request node_helper to get json from url
	getJson: function () {
		this.sendSocketNotification("MMM-Sonnen_GET_JSON", this.config.url);
	},

	socketNotificationReceived: function (notification, payload) {
		if (notification === "MMM-Sonnen_JSON_RESULT") {
			// Only continue if the notification came from the request we made
			// This way we can load the module more than once
			if (payload.url === this.config.url)
			{
				this.jsonData = payload.data;
				this.updateDom(500);
			}
		}
	},

	// Override dom generator.
	getDom: function () {
		var wrapper = document.createElement("div");
		wrapper.className = "xsmall";

		if (!this.jsonData) {
			wrapper.innerHTML = "Awaiting json data...";
			return wrapper;
		}
		var table = document.createElement("table");
		var tbody = document.createElement("tbody");
		var items = [];
		items = this.jsonData;
		console.log("BatteryCharging" + items["BatteryCharging"]);
		console.log(this.config.values[0]);
		// Try to do the translation
		for(var i=0;i<this.config.values.length;i++){
			console.log("i - " + this.config.values[i][0]);
			// Go and find the values
			console.log(this.config.values[i][1] + " : " + items[this.config.values[i][0]]);
			var row = this.getTableRow(this.config.values[i][1], items[this.config.values[i][0]], this.config.values[i][2]);
			tbody.appendChild(row);


			
	
		}

//		items.forEach(element => {
//			var row = this.getTableRow(element);
//			tbody.appendChild(row);
//		});

		table.appendChild(tbody);
		wrapper.appendChild(table);
		return wrapper;
	},

	getTableRow: function (key, value,unit) {
		var row = document.createElement("tr");
		var cellKey = document.createElement("td");
		var cellVal = document.createElement("td");
		var cellUni = document.createElement("td");
		cellKey.appendChild(document.createTextNode(key));
		cellVal.appendChild(document.createTextNode(value));
		cellUni.appendChild(document.createTextNode(unit));
		row.appendChild(cellKey);
		row.appendChild(cellVal);
		row.appendChild(cellUni);
		return row;
	},

	// Format a date string or return the input
	getFormattedValue: function (input) {
		var m = moment(input);
		if (typeof input === "string" && m.isValid()) {
			// Show a formatted time if it occures today
			if (m.isSame(new Date(), "day") && m.hours() !== 0 && m.minutes() !== 0 && m.seconds() !== 0) {
				return m.format("HH:mm:ss");
			}
			else {
				return m.format("YYYY-MM-DD");
			}
		}
		else {
			return input;
		}
	}

});
