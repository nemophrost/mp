<?php

if (isset($_REQUEST['url'])) {
	$url = urldecode($_REQUEST['url']);
	
	$link = mysql_connect('mp', 'root', 'password');
	if (!$link) {
		die('Could not connect: ' . mysql_error());
	}
	
	mysql_select_db('mp');
	
	// Formulate Query
	// This is the best way to perform an SQL query
	// For more examples, see mysql_real_escape_string()
	$query = sprintf("SELECT data FROM pages WHERE url='%s'",
		mysql_real_escape_string($url));
	
	// Perform Query
	$result = mysql_query($query);
	
	// Check result
	// This shows the actual query sent to MySQL, and the error. Useful for debugging.
	if (!$result) {
		$message  = 'Invalid query: ' . mysql_error() . "\n";
		$message .= 'Whole query: ' . $query;
		die($message);
	}
	
	// Use result
	// Attempting to print $result won't allow access to information in the resource
	// One of the mysql result functions must be used
	// See also mysql_result(), mysql_fetch_array(), mysql_fetch_row(), etc.
	$row = mysql_fetch_assoc($result);
	if ($row) {
		echo $row['data'];
	}
	else {
		$data = file_get_contents($url);
		
		$insert = sprintf("INSERT INTO pages (url,data) VALUES ('%s','%s')",
			mysql_real_escape_string($url),
			mysql_real_escape_string($data));
		
		$saved = mysql_query($insert);
	
		// Check result
		// This shows the actual query sent to MySQL, and the error. Useful for debugging.
		if (!$saved) {
			$message  = 'Invalid query: ' . mysql_error() . "\n";
			$message .= 'Whole query: ' . $insert;
			die($message);
		}
		
		echo $data;
	}
}
else {
	echo 'error';
}

?>