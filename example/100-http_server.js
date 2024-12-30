// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import Engine from '../api/engine.js';
import Timing from '../api/timing.js';
import HTTPServer from '../api/http_server.js';
import File from '../api/file.js';

// Examples: HTTP Server ---------------- //

const LIFEFILE='../server_running';
const PUBLIC_ROOT='../web/public';
const DOCS_ROOT='../web/docs/html';
const TEST_ROOT='../web/test';

function hello_world(wlk){
	wlk.res.end('Hello World!');
}

var route1=HTTPServer.present({GET:hello_world});
var route2=HTTPServer.serve(PUBLIC_ROOT,{
	route:{
		'doc':HTTPServer.serve(DOCS_ROOT),
		'test':HTTPServer.serve(TEST_ROOT,{
			dirent:true,
			deepent:-1,
			mtime:true,
			filter:(srcdir,name,stat)=>{
				return name.at(0)!='.';
			},
		}),
	},
});

Engine.start();

var srv1=HTTPServer.setup(8080,route1).fetch();
var srv2=HTTPServer.setup(8888,route2).fetch();

(async()=>{
	await File.save(LIFEFILE,'');

	srv1.open();
	srv2.open();

	await Timing.syncKit(100,()=>{
		return !File.exists(LIFEFILE);
	}).promise();

	srv1.close();
	srv2.close();

	await Engine.toPromise();
	Engine.shutdown();
})();
