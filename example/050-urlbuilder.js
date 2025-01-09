// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

// Example: URL Builder ----------------- //

import URLBuilder from '../api/urlbuilder.js';
import Log from '../api/logger.js';

Log.Info('----- Parse nonURL -----');
let url='a/b%2Fc.txt?a=1&b=2#abc#xyz';
let a=URLBuilder.Parse(url);
Log.Info(JSON.stringify(a));

Log.Info('----- Parse mailto URL -----');
url='mailto:user@example.com';
a=URLBuilder.Parse(url);
Log.Info(JSON.stringify(a));

Log.Info('----- Parse file URL -----');
url='file:///c:/Program%20Files/Internet%20Explorer/iexplore.exe';
a=URLBuilder.Parse(url);
Log.Info(JSON.stringify(a));

Log.Info('----- Parse FTP URL -----');
url='ftp://user:pwd@ftp.example.com/a/b/c.txt';
a=URLBuilder.Parse(url);
Log.Info(JSON.stringify(a));

Log.Info('----- Parse minimum HTTP URL -----');
url='https://www.example.com';
a=URLBuilder.Parse(url);
Log.Info(JSON.stringify(a));

Log.Info('----- Parse Heavy URL -----');
url='https://us%65r:pw%64@www.example.com:8080/%7Ea/b%2Fc.html?q=ijk+lmn&a=1&b[a][b][]=123&b[a][c]=789&b[a][b][]=de%2Bf#abc#xyz';
a=URLBuilder.Parse(url);
Log.Info(JSON.stringify(a));

// can extract host 
Log.Info('----- Extract & Retouch Host -----');
let b=a.ExtractHost();
Log.Info(JSON.stringify(b));

// can retouch host 
b[0]+=0;
b.unshift('test');
a.BakeHost(b);
Log.Info(a.host);

// can extract path 
Log.Info('----- Extract & Retouch Path -----');
b=a.ExtractPath();
Log.Info(JSON.stringify(b));

// can retouch path 
b[b.length-1]='';
a.BakePath(b);
Log.Info(a.Path);

// can extract args or prop 
Log.Info('----- Extract Args or Prop -----');
let b1=a.ExtractArgs();
Log.Info(JSON.stringify(b1));
let b2=a.ExtractProp();
Log.Info(JSON.stringify(b2));

// can retouch args or prop (are exclusive)
Log.Info('----- Retouch Args or Prop -----');
b1.push('xyz');
a.BakeArgs(b1);
Log.Info(a.Query);

b2.b.a.d='xyz';
b2.b.a.b.push(-3.14);
a.BakeProp(b2);
Log.Info(a.Query);

Log.Info('----- Bake All -----');
Log.Info(a.Bake());
