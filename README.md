# Yggdrasil Essence for Deno

Copyright © 2024-5 [Yggdrasil Leaves, LLC.](https://yggdrasil-leaves.com)

## What's it?

These are useful extra features on Deno.  
You can select source files under your wish from this solution and copy freely.  

## Need a Help?

But we'll not help you:-P

## Documentation

see web version that placed in web submodule.  
to build by Doxygen.  
see web/README.md  

## Testing

Run a Test Runner of Deno standard.  

```
$ cd test
$ deno test **/*
```

### for Windows

Can one touch testing with test_all.bat

## Sample web server

Run a server.  
```
$ cd example
$ deno run --allow-net --allow-read --allow-write 100-http_server.js
```

Access by your web browser.  

- http://localhost:8080/
	- Hello World!
- http://localhost:8888/
	- Show the Home Page.
- http://localhost:8888/doc/
	- Show docs. (see Documentation)
- http://localhost:8888/test.html
	- Run Test Runner.

### Shutdown the server

```
$ rm server_running
```


## For Your Project

### Fork this Repository

should not clone from this repository directly.  
this repository often changes reconstructive
and may break your project.  

### Create a Branch for Your Project

should not use main. 
main should keep clean to update from the upstream.  

### Update Yggdrasil Essence

sync main in your repository.  
and merge to your branch as needed.  
BE CAREFUL.  
