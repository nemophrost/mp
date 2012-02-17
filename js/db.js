var mp = {db:{}};

$(function() {
	
	/* INDEXED DB STORAGE
	==========================================================================*/
	mp.db.open = function() {
		var request = indexedDB.open("areas",
			"This is a description of the database.");

		request.onsuccess = function(e) {
			var v = "1.0";
			mp.db.db = e.result;
			var db = mp.db.db;
			// We can only create Object stores in a setVersion transaction;
			if(v!= db.version) {
				var setVrequest = db.setVersion(v);

				// onsuccess is the only place we can create Object Stores
				setVrequest.onfailure = mp.db.onerror;
				setVrequest.onsuccess = function(e) {
					var store = db.createObjectStore("area",
						{keyPath: "id"});

					mp.db.getAllAreas();
				};
			}

			mp.db.getAllAreas();
		};

		request.onfailure = mp.db.onerror;
	}

	mp.db.addArea = function(id, data) {
		var db = mp.db.db;
		var trans = db.transaction(["area"], IDBTransaction.READ_WRITE, 0);
		var store = trans.objectStore("area");
		var request = store.put({
			"id": id,
			"data": data
		});

		request.onsuccess = mp.db.onsuccess;

		request.onerror = mp.db.onerror;
	};

	mp.db.getAllAreas = function() {
		//var todos = document.getElementById("todoItems");
		//todos.innerHTML = "";

		var db = mp.db.db;
		var trans = db.transaction(["area"], IDBTransaction.READ_WRITE, 0);
		var store = trans.objectStore("area");

		// Get everything in the store;
		var cursorRequest = store.openCursor();

		cursorRequest.onsuccess = function(e) {
			if(e.result == null) return;

			updateAreaPages(e.result.value); // Defined a little later.
			e.result.continue();
		};

		cursorRequest.onerror = mp.db.onerror;
	};

	function updateAreaPages(area) {
		var id = area.id,
			data = area.data;

	}

	mp.db.onsuccess = function(e) {
		console.log(e.value);
	};

	mp.db.onerror = function(e) {
		console.log(e.value);
	};

	mp.db.open();
});
