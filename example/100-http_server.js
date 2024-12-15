// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Example: HTTP Server //

import engine from '../api/engine.js';
import timing from '../api/timing.js';
import server from '../api/http_server.js';
import file from '../api/file.js';

const LIFEFILE='../server_running';
const DOCSROOT='../web/docs/html';

function bye(wlk){
	file.remove(LIFEFILE);
	wlk.res.end('See You Again!');
}

function hello_world(wlk){
	wlk.res.end('Hello World!');
}

var route1=server.route({
	'bye':server.present({GET:bye}),
	'':server.present({GET:hello_world}),
});
var route2=server.transfer(DOCSROOT);

engine.start();

var srv1=server.setup(8080,route1).fetch();
var srv2=server.setup(8888,route2).fetch();

(async()=>{
	await file.save(LIFEFILE,'');

	srv1.open();
	srv2.open();

	await timing.syncKit(100,()=>{
		return !file.exists(LIFEFILE);
	}).promise();

	srv1.close();
	srv2.close();

	await engine.toPromise();
	engine.shutdown();
})();
