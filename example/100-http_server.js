// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Engine from '../api/engine.js';
import Timing from '../api/timing.js';
import HTTPServer from '../api/http_server.js';
import File from '../api/file.js';

// Examples: HTTP Server ---------------- //

const LIFEFILE='../!http_server_running';
const PUBLIC_ROOT='../web/public';
const DOCS_ROOT='../web/docs/html';
const TEST_ROOT='../web/test';

function hello_world(walker){
	walker.Response.end('Hello World!');
}

var route1=HTTPServer.Present({GET:hello_world});
var route2=HTTPServer.Serve(PUBLIC_ROOT,{
	Route:{
		'doc':HTTPServer.Serve(DOCS_ROOT),
		'test':HTTPServer.Serve(TEST_ROOT,{
			DirEnt:true,
			DeepEnt:-1,
			MTime:true,
			Filter:(srcdir,name,stat)=>{
				return name.at(0)!='.';
			},
		}),
	},
});

Engine.Start();

var srv1=HTTPServer.SetUp(8080,route1).Fetch();
var srv2=HTTPServer.SetUp(8888,route2).Fetch();

(async()=>{
	await File.Save(LIFEFILE,'');

	srv1.Open();
	srv2.Open();

	await Timing.SyncKit(100,()=>{
		return !File.Exists(LIFEFILE);
	}).ToPromise();

	srv1.Close();
	srv2.Close();

	await Engine.ToPromise();
	Engine.ShutDown();
})();
