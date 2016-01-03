var RootScreen = function() {
	return Screen.run(function*() {
		yield LoadingScreen();
		
		while (true) {
			yield TitleScreen();
			yield MainScreen();
		}
	});
}