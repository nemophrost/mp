function map(ar, f) {
	var len = ar.length;
	for (var i = 0; i < len; i++) {
		f(ar[i], i);
	}
}
