(function() {
	'use strict';



	var app = angular.module('app', ['ngAnimate', 'ui.bootstrap']);
	
	app.filter('prettyJSON', function () {
	    function prettyPrintJson(json) {
	      return JSON ? JSON.stringify(json, null, '  ') : 'your browser doesnt support JSON so cant pretty print';
	    }
	    return prettyPrintJson;
	});
	
	
	app.controller('MainCtrl', function($scope, $location, $http, $window, $log) {

		$scope.templates ={ 
			'sidebar' : 'include/sidebar.html',
			'list' : 'include/list.html',
			'list_text' : 'include/list_text.html',
			'list_uri' : 'include/list_uri.html',
			'list_array' : 'include/list_array.html',
			'edit' : 'include/edit.html',
			'edit_text' : 'include/edit_text.html',
			'edit_uri' : 'include/edit_uri.html',
			'edit_array' : 'include/edit_array.html'
		},
		
		
		$scope.resourceSet = null; //root resource
		
		$scope.collectionRequest  = {'name':null,'href':null, 'profile': {}, 'sort':{}, 'page':1, 'size': 10};
		$scope.collectionResponse = null;
		
		$scope.itemRequest  = {'name':null,'href':null, 'profile': {}};
		$scope.itemResponse  = null;
		
		///////////////////////////////////////////////
		//
		///////////////////////////////////////////////
		$scope.initialize = function(){

			$http({
				method : 'GET',
				url : $location.url()

			}).success(function(d, s, f, c) {
				$log.info('['+c.method+'] '+ c.url+ ' '+s);
				
				
				$scope.resourceSet = d;
				$scope.resourceSet.uri = c.url;
				
				$scope.initializeSchema();
				
			}).error(function(e, s, f, c) {
				$window.alert('['+c.method+'] '+ c.url+ ' '+s+'\n\n'+JSON.stringify(e, null, '  '));
			});
		}
		
		$scope.initializeSchema = function(){

			$http({
				method : 'GET',
				url : $scope.resourceSet._links.profile.href
			}).success(function(d, s, f, c) {
				$log.info('['+c.method+'] '+ c.url+ ' '+s);
			
				
				for(var k in d._links){
					if('self' != k){
						$scope.initializeSchemaChild(k, d._links[k]);
					}
				}
				
			}).error(function(e, s, f, c) {
				$window.alert('['+c.method+'] '+ c.url+ ' '+s+'\n\n'+JSON.stringify(e, null, '  '));
			});
		}
		
		$scope.initializeSchemaChild = function(k, v){

			$http({
				method : 'GET',
				headers : {'Accept' : 'application/schema+json'},
				url : v.href
			}).success(function(d1, s1, f1, c1) {
				$log.info('['+c1.method+'] '+ c1.url+ ' '+s1);
			
				$http({
					method : 'GET',
					url : v.href
				}).success(function(d2, s2, f2, c2) {
					$log.info('['+c2.method+'] '+ c2.url+ ' '+s2);

					$scope.resourceSet._links[k]['profile'] = $scope.initializeSchemaChildProfile(v.href, d1, d2);
					
					
				}).error(function(e, s, f, c) {
					$window.alert('['+c.method+'] '+ c.url+ ' '+s+'\n\n'+JSON.stringify(e, null, '  '));
				});
				
				
			}).error(function(e1, s1, f1, c1) {
				$window.alert('['+c1.method+'] '+ c1.url+ ' '+s1+'\n\n'+JSON.stringify(e1, null, '  '));
			});
		}
		
		$scope.initializeSchemaChildProfile = function(href, d1, d2){
			
			//$log.debug(href);
			//#/properties
			var properties = d1.properties;
			for(var key in d1.properties){
				//$log.debug(key);
				var val = properties[key];
				
				//#/properties/{name}/items
				if(val.items != null){
				
					var ref = val.items['$ref'];
					
					//$ref <-> #/definitions 
					var definitions = null;
					var node = ref.split('/');
					for(var i=0; i < node.length; i++ ){
						if(node[i] == '#'){
							definitions = d1;
						}else{
							definitions = definitions[node[i]];
						}
					}
					
					//#/definitions/properties
					val['items'] = definitions.properties;
				}
			}
			
			
			var aplsDescriptors = d2.alps.descriptors;
			for(var i = 0 ; i < aplsDescriptors.length ; i++){
				
				if(aplsDescriptors[i].href == href){
					
					var descriptors = aplsDescriptors[i].descriptors;
					
					for(var j = 0 ; j < descriptors.length ; j++){

						var name = descriptors[j].name;
						
						var properties = d1.properties[name];
						
						properties['descriptor'] = descriptors[j];
						
						
						var rt = properties['descriptor']['rt'];
						if(rt != null){
							
							//http://localhost:8080/autos#auto-representation
							var s = rt.indexOf('profile/');
							var e = rt.indexOf('#');
							
							properties['descriptor']['rtName'] = rt.substring(s + 8 , e);
						}
						
					}
				}
			}
			return d1;
		}
		
		
		
		///////////////////////////////////////////////
		//
		///////////////////////////////////////////////
		$scope.load = function(name, href){
			$log.debug('load():');
			
        	$scope.itemRequest = null;
        	$scope.itemResponse = null;
			
			$scope.collectionRequest = {};
			$scope.collectionRequest.name = name;
			$scope.collectionRequest.href = href.replace('{?page,size,sort}', '');
			$scope.collectionRequest.profile = $scope.resourceSet._links[name]['profile'];

			$scope.collectionResponse = null;
			
			$scope.readAll();
		}

		///////////////////////////////////////////////
		//
		///////////////////////////////////////////////
		$scope.findAll = function(item, prop){
			$log.debug('findAll():');
			
			var rtName = prop.descriptor.rtName;
			var name = prop.descriptor.name;
			var url = null;
			try{
				url = $scope.resourceSet._links[rtName].href
			}catch(e){
				item[rtName] = null;
            	return;
			}
			
			$http({
                method : 'GET',
                url : url.replace('{?page,size,sort}', ''),
                params : {
                	'size' : 1000
                }

			}).success(function(d, s, f, c) {
            	$log.info('['+c.method+'] '+ c.url+ ' '+s);

            	item[name+'ValueList'] = [];
            	
            	
            	var list = d._embedded[rtName];
             	
            	item[name+'ValueList'].push({'name' : 'None', 'value' : null});
            	
            	for(var i = 0 ; i < list.length; i++){
            		
            		var val = list[i]._links.self.href;
            		delete list[i]._links;
            		
                	item[name+'ValueList'].push({'name' : list[i], 'value' : val});
            	}
 				
			}).error(function(e, s, f, c) {

            	
			});
		}

		
		$scope.find = function(item, prop){

			$log.debug('find():');
			
			var rtName = prop.descriptor.rtName;
			var name = prop.descriptor.name;
			var url = null;
			try{
				url = item._links[name].href;
			}catch(e){
				item[name+'Value'] = null;
				item[name] = null;
            	return;
			}
			
			$http({
                method : 'GET',
                url : url

			}).success(function(d, s, f, c) {
            	$log.info('['+c.method+'] '+ c.url+ ' '+s);

				item[name+'Value'] = d;
				item[name] = d._links.self.href;

				delete item[name+'Value']._links;
				
				
			}).error(function(e, s, f, c) {
				item[name+'Value'] = null;
				item[name] = null;
			});
		}
		
		
		
		
		///////////////////////////////////////////////
		//
		///////////////////////////////////////////////
		$scope.readAll = function(){
			$log.debug('readAll():');

			var size = $scope.collectionRequest['size'];
			var page = $scope.collectionRequest['page'] - 1;
			var sort = [];
			for(var k in $scope.collectionRequest['sort']){
				var v = $scope.collectionRequest['sort'][k];
				if('desc' == v || 'asc' == v){
					sort.push(k+','+v);
				}
			}
			
            $http({
                method : 'GET',
                url : $scope.collectionRequest.href,
                params : {
                	'page' : page,
                	'size' : size,
                	'sort' : sort
                }

			}).success(function(d, s, f, c) {
            	$log.info('['+c.method+'] '+ c.url+ ' '+s);

            	$scope.collectionResponse = d;
            	$scope.collectionRequest['size'] = d.page.size;
            	$scope.collectionRequest['page'] = d.page.number + 1;
            	
            	
            	$scope.itemRequest = null;
            	$scope.itemResponse = null;

			}).error(function(e, s, f, c) {
				$window.alert('['+c.method+'] '+ c.url+ ' '+s+'\n\n'+JSON.stringify(e, null, '  '));
			});
		}
		
		$scope.editForm = function(name, href, item){


			$log.debug('editForm():');
			
			
        	$scope.itemRequest = null;
        	$scope.itemResponse = null;
			
			$scope.itemRequest = {};
			$scope.itemRequest['name'] = name;
			$scope.itemRequest['profile'] = $scope.resourceSet._links[name].profile;

			if(item == null){
				$scope.itemRequest['href'] = href;
				$scope.isNewMode = true;
				$scope.createForm()
			}else{
				$scope.itemRequest['href'] = item._links.self.href;
				
				$scope.isNewMode = false;
				$scope.updateForm(item);
			} 
		}
		
		$scope.edit = function(){
			if($scope.isNewMode){
				$scope.create();
			}else{
				$scope.update();
			}
		}
		
		$scope.createForm = function(name, href){
			$log.debug('createForm():');

			
			$scope.itemResponse = {};
			
			var properties = $scope.itemRequest.profile.properties;
			for(var key in properties){
				var val = properties[key];
				
				if(val.type == 'array'){
					$scope.itemResponse[key] = [];
					$scope.itemResponse[key+'Buffer'] = {}
				}else{
					$scope.itemResponse[key] = null;
				}
				
				if(val.format == 'uri'){
					$scope.findAll($scope.itemResponse, val);
				}
			}
			
			$('#myModal').modal('show');
		}
		
		$scope.updateForm = function(item){
			$log.debug('updateForm():');
			
			
			$http({
				method : 'GET',
				url : $scope.itemRequest.href

			}).success(function(d, s, f, c) {
            	$log.info('['+c.method+'] '+ c.url+ ' '+s);
           	
				var properties = $scope.itemRequest.profile.properties;
				for(var key in properties){
					var val = properties[key];
					if(val.format == 'uri'){
						$scope.find(d, val);
						$scope.findAll(d, val);
					}
				}
				
				$scope.itemResponse = d;
				
				
				
				$('#myModal').modal('show');
			}).error(function(e, s, f, c) {
				$window.alert('['+c.method+'] '+ c.url+ ' '+s+'\n\n'+JSON.stringify(e, null, '  '));
			});
		}
		
		
		$scope.create = function(){
			$log.debug('create():');
			
			$http({
				method : 'POST',
				url : $scope.itemRequest.href,
				headers : {'Content-Type' : 'application/json; charset=UTF-8'},
				data : $scope.itemResponse

			}).success(function(d, s, f, c) {
            	$log.info('['+c.method+'] '+ c.url+ ' '+s);

				$('#myModal').modal('hide');
				$scope.readAll();

			}).error(function(e, s, f, c) {
				$window.alert('['+c.method+'] '+ c.url+ ' '+s+'\n\n'+JSON.stringify(e, null, '  '));
			});
		}

		
		$scope.update = function(){
			$log.debug('update():');
			
			$http({
				method : 'PUT',
				url : $scope.itemRequest.href,
				headers : {'Content-Type' : 'application/json; charset=UTF-8'},
				data : $scope.itemResponse

			}).success(function(d, s, f, c) {
            	$log.info('['+c.method+'] '+ c.url+ ' '+s);

				$('#myModal').modal('hide');
				$scope.readAll();
				
			}).error(function(e, s, f, c) {
				$window.alert('['+c.method+'] '+ c.url+ ' '+s+'\n\n'+JSON.stringify(e, null, '  '));
			});
		}
		
		
		$scope.deleteForm = function(item){
			
			var confirm = $window.confirm('Are you sure?');
			if(! confirm) return ;
			
			$log.debug('deleteForm():');

			$http({
				method : 'DELETE',
				url : item._links.self.href

			}).success(function(d, s, f, c) {
            	$log.info('['+c.method+'] '+ c.url+ ' '+s);

            	$scope.readAll();
				
			}).error(function(e, s, f, c) {
				$window.alert('['+c.method+'] '+ c.url+ ' '+s+'\n\n'+JSON.stringify(e, null, '  '));
			});
		}
		
	});

	
})();	
	
