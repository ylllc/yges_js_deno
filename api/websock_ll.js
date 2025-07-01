// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2025 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import YgEs from './common.js';

import {WebSocketServer} from 'npm:ws';

// WebSocket Low Level for Deno --------- //
(()=>{ // local namespace 

function _server_new(port,opt={}){

	port=YgEs.Validate(port,{Integer:true},'port');
	opt=YgEs.Validate(opt,{Struct:{
		Name:{Literal:true},
		ConnectionLimit:{Integer:true,Min:-1,Default:-1},
		OnConnect:{Callable:true,Default:(cnx)=>{}},
		OnDisconnect:{Callable:true,Default:(cnx)=>{}},
		OnReceived:{Callable:true,Default:(cnx,data,isbin)=>{}},
		OnError:{Callable:true,Default:(cnx,err)=>{}},
	}},'opt');

	let server=YgEs.SoftClass();
	let server_priv=server.Extend('YgEs.WebSockLowLevel.Server',{
		// private 
		ll:new WebSocketServer({port:port}),
		clicnt:0,
	},{
		// public 
		Close:(cb_done)=>{
			server_priv.ll.clients.forEach((sock)=>{sock.close();});
			server_priv.ll.close(()=>{
				server_priv.ll.clients.forEach((sock)=>{
					if(![sock.OPEN,sock.CLOSING].includes(sock.readyState))return;
					sock.terminate();
				});

				server_priv.ll=null;
				if(cb_done)cb_done();
			});
		},
	});

	server_priv.ll.on('connection',(sock,req)=>{

		if(opt.ConnectionLimit>=0 && opt.ConnectionLimit<=server_priv.clicnt){
			sock.terminate();
			return;
		}

		let cnx=YgEs.SoftClass();
		let cnx_priv=cnx.Extend('YgEs.WebSockLowLevel.Connection',{
			// private 
			ready:false,
			sock:sock,
		},{
			// public 
			IsReady:()=>cnx_priv.ready,
			Close:(code=1000,msg='Shut from the server')=>{
				if(!cnx_priv.ready)return;
				cnx_priv.ready=false;
				sock.close(code,msg);
				sock=null;
			},
			Send:(data)=>{
				if(!cnx.IsReady())return;
				sock.send(data);
			},
		});

		sock.on('error',(err)=>{
			opt.OnError(cnx,err);
		});

		sock.on('close',()=>{
			opt.OnDisconnect(cnx);
			--server_priv.clicnt;
		});
		sock.on('message',(data,isbin)=>{
			opt.OnReceived(cnx,data,isbin);
		});

		cnx_priv.ready=opt.OnConnect(cnx,req);
		if(!cnx_priv.ready){
			sock.terminate();
			cnx_priv.sock=sock=null;
		}
		else{
			// allowed client 
			++server_priv.clicnt;
		}
	});

	return server;
}

let WebSockLowLevel=YgEs.WebSockLowLevel={
	Name:'YgEs.WebSockLowLevel',
	User:{},
	_private_:{},

	CreateServer:_server_new,
}

})();
export default YgEs.WebSockLowLevel;
