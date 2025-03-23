// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from '../api/common.js';
import Engine from '../api/engine.js';
import Timing from '../api/timing.js';
import WebSockServer from '../api/websock_server.js';
import Log from '../api/logger.js';
import File from '../api/file.js';

// Examples: WebSocket Server ----------- //

const LIFEFILE='../!websock_server_running';

Engine.Start();

// proc by connection 
function _task_new(name,ctx,interval){

	let canceller=null;
	let task={

		Open:()=>{
			canceller=Timing.Poll(interval,()=>{
				ctx.Send(name+' ServerTime: '+(new Date().toISOString()));
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

function _server_new(name,port,interval){

	// task by ClientID 
	let tasks={}

	let opt={
		// max clients 
		ConnectionLimit:5,

		OnConnect:(ctx,req)=>{
			ctx.ClientID=YgEs.NextID();
			Log.Info('client came: '+ctx.ClientID);
			ctx.Send('welcome to '+name);

			// [ToDo] confirm enablity from req, return false to reject it 

			// create a task for this connection 
			if(tasks[ctx.ClientID])tasks[ctx.ClientID].Close();
			tasks[ctx.ClientID]=_task_new(name,ctx,interval);
			return true;
		},
		OnDisconnect:(ctx)=>{
			Log.Info('client gone: '+ctx.ClientID);

			// must close for terminate 
			let task=tasks[ctx.ClientID];
			if(!task)return;
			task.Close();
			delete tasks[ctx.ClientID];
		},
		OnReceived:(ctx,msg,isbin)=>{
			Log.Info('msg from '+ctx.ClientID+': '+msg);
		},
		OnError:(ctx,err)=>{
			Log.Fatal('error in '+ctx.ClientID+': '+err);
		},
	}

	// create a server instance 
	let server=WebSockServer.SetUp(port,opt);
	return server.Fetch();
}

var srv1=_server_new('srv1',9801,1000);
var srv2=_server_new('srv2',9821,10000);

(async()=>{
	// create LIFEFILE 
	await File.Save(LIFEFILE,'');

	// start server instances 
	srv1.Open();
	srv2.Open();

	// keep during LIFEFILE exists 
	await Timing.SyncKit(100,()=>{
		return !File.Exists(LIFEFILE);
	}).ToPromise();

	// stop server instances 
	srv1.Close();
	srv2.Close();

	// wait for end of all procedures 
	await Engine.ToPromise();
	Engine.ShutDown();
})();
