$(function() {

	var indexedDB = window.mozIndexedDB || window.webkitIndexedDB,
		IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;

	mp.db = {};

	/* INDEXED DB STORAGE
	==========================================================================*/
	mp.db.open = function(rootAreaId) {
		var request = indexedDB.open('mp',
			'Mountain Project database');

		request.onsuccess = function(e) {
			var v = '1.0',
				db = e.target.result;

			mp.db.db = db;

			//console.log(e);
			// We can only create Object stores in a setVersion transaction;
			if(v!= db.version) {
				var setVrequest = db.setVersion(v);

				// onsuccess is the only place we can create Object Stores
				setVrequest.onfailure = mp.db.onerror;
				setVrequest.onsuccess = function(e) {
					var areaStore = db.createObjectStore('area', {keyPath: 'id'});
					var routeStore = db.createObjectStore('route', {keyPath: 'id'});

					$(document).triggerHandler('init');
				};
			}
			else {
				$(document).triggerHandler('init');
			}
		};

		request.onfailure = mp.db.onerror;
	}

	mp.db.saveArea = function(id, data) {
		var db = mp.db.db,
			trans = db.transaction(['area'], IDBTransaction.READ_WRITE, 0),
			store = trans.objectStore('area'),
			request = store.put({
				'id': id,
				'data': data
			});

		request.onsuccess = mp.db.onsuccess;
		request.onerror = mp.db.onerror;
	}

	mp.db.getArea = function(id, callback) {
		var db = mp.db.db,
			trans = db.transaction(['area'], IDBTransaction.READ_WRITE, 0),
			store = trans.objectStore('area'),
			request = store.get(id);

		request.onsuccess = function(e) {
			callback(request.result);
		};

		request.onerror = function(e) {
			callback();
		};
	}

	mp.db.saveRoute = function(id, data) {
		var db = mp.db.db,
			trans = db.transaction(['route'], IDBTransaction.READ_WRITE, 0),
			store = trans.objectStore('route'),
			request = store.put({
				'id': id,
				'data': data
			});

		request.onsuccess = mp.db.onsuccess;
		request.onerror = mp.db.onerror;
	}

	mp.db.getRoute = function(id, callback) {
		var db = mp.db.db,
			trans = db.transaction(['route'], IDBTransaction.READ_WRITE, 0),
			store = trans.objectStore('route'),
			request = store.get(id);

		request.onsuccess = function(e) {
			callback(request.result);
		};

		request.onerror = function(e) {
			callback();
		};
	}

	/*mp.db.getAllAreas = function() {
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
	};*/

	function updateAreaPages(area) {
		var id = area.id,
			data = area.data;

	}

	mp.db.onsuccess = function(e) {
		mp.log(e.value);
	};

	mp.db.onerror = function(e) {
		mp.log(e.value);
	};

	mp.db.open(rootId);
});
