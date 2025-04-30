// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Engine from '../api/engine.js';
import Timing from '../api/timing.js';
import WebSockClient from '../api/websock_client.js';
import Log from '../api/logger.js';
import File from '../api/file.js';

// Example: WebSocket Client ------------ //

const LIFEFILE='../!websock_client_running';

Engine.Start();

// proc by connection 
function _task_new(client,interval){

	let canceller=null;
	let task={

		Open:()=>{
			canceller=Timing.Poll(interval,()=>{
				client.Send('ClientTime: '+(new Date().toISOString()));
			});
		},
		Close:()=>{
			if(!canceller)return;
			canceller();
			canceller=null;
		}
	}

	task.Open();
	return task;
}

function _client_new(name,url,interval){

	let task=null;
	let opt={
		// wait ms and auto reconnect when disconnected 
		AutoReconnectWait:5000, 

		OnConnected:()=>{
			Log.Info('WebSock client '+name+' is ready');

			// create a task for this connection 
			task=_task_new(client,interval);
		},
		OnDisconnected:(normal)=>{

			// must close for terminate 
			if(!task)return;
			task.Close();
			return;
		},
		OnReceived:(msg)=>{
			Log.Info(msg);
		},
		OnError:(err)=>{
			Log.Fatal(err.message,err);
		},
	}
	let client=WebSockClient.SetUp(url,opt);
	return client.Fetch();
}

var cli1=_client_new('cli1','ws://localhost:9801',1000);
var cli2a=_client_new('cli2a','ws://localhost:9821',15000);
var cli2b=_client_new('cli2b','ws://localhost:9821',20000);

(async()=>{
	// create LIFEFILE 
	await File.Save(LIFEFILE,'');

	// start client instances 
	cli1.Open();
	cli2a.Open();
	cli2b.Open();

	// keep during LIFEFILE exists 
	await Timing.SyncKit(100,()=>{
		return !File.Exists(LIFEFILE);
	}).ToPromise();

	// stop client instances 
	cli1.Close();
	cli2a.Close();
	cli2b.Close();

	// wait for end of all procedures 
	await Engine.ToPromise();
	Engine.ShutDown();
})();
