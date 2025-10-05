// Define a new instance of the FES
var dfes

function saveDOMImage(el,opt){
	if(!opt) opt = {};
	if(!opt.src) opt.src = "map.png";
	if(opt.scale){
		if(!opt.height) opt.height = el.offsetHeight*2;
		if(!opt.width) opt.width = el.offsetWidth*2;
		// Force bigger size for element
		w = el.style.getPropertyValue('width');
		h = el.style.getPropertyValue('height');
		el.style.setProperty('width',(opt.width)+'px');
		el.style.setProperty('height',(opt.height)+'px');
	}
	el.classList.add('capture');
	domtoimage.toPng(el,opt).then(function(dataUrl){
		var link = document.createElement('a');
		link.download = opt.src;
		link.href = dataUrl;
		link.click();
		// Reset element
		if(opt.scale){
			el.style.setProperty('width',w);
			el.style.setProperty('height',h);
		}
		el.classList.remove('capture');
	});
}
if(!OI) var OI = {};
if(!OI.ready){
	OI.ready = function(fn){
		// Version 1.1
		if(document.readyState != 'loading') fn();
		else document.addEventListener('DOMContentLoaded', fn);
	};
}
OI.ready(function(){

	dfes = new FES({
		"files": {
			"parameters": "data/scenarios/config.json"
		},
		"options": {
			"scenario": "NPg Reference Scenario",
			"view": "primaries",
			"key": "2024",
			"parameter": "ev",
			"scale": "relative",
			"years": {"min":2024, "max":2051},
			"map": {
				"bounds": [[52.6497,-5.5151],[56.01680,2.35107]],
				"attribution": "Vis: <a href=\"https://open-innovations.org/projects/\">Open Innovations</a>, Data: ENWL/Element Energy"
			}
		},
		"mapping": {
			"primary": {
				"LADlayer": {
					"file": "data/primaries2lad.json"
				},
				"PRIMARYlayer": {}
			},
			"la": {
				"LADlayer": {}  // No mapping needed - direct LA data
			}
		},
		"layers": {
			"LADlayer":{
				"geojson": "data/maps/enwl_dfes_local_authority_polygons.geojson",
				"key": "local_authority",
				"name": "local_authority"
			},
			"PRIMARYlayer":{
				"geojson":"data/maps/enwl-pry-voronoi.geojson",
				"key": "pry_group",
				"name": "pry_group"
			}
		},
		"views":{
			"LAD":{
				"title":"Local Authorities",
				"source": "la",
				"layers":[{
					"id": "LADlayer",
					"heatmap": true,
					"boundary":{"strokeWidth":2}
				}],
				"popup": {
					"text": function(attr){
						var popup,title,dp,value;
						popup = '<h3>%TITLE%</h3><p>%VALUE%</p>';
						title = (attr.properties[attr.name]||'?');
						dp = (typeof attr.parameter.dp==="number" ? attr.parameter.dp : 2);
						if(typeof attr.value!=="number") this.log('WARNING','No numeric value for '+attr.id)
						// Get parameter title from the loaded parameters
						var paramTitle = 'Data';
						console.log('Parameter title debug - this.parameters:', this.parameters);
						console.log('Parameter title debug - this.options.parameter:', this.options.parameter);
						
						// Map LA parameter back to base parameter
						var baseParameter = this.options.parameter;
						if(baseParameter.endsWith('-la')) {
							baseParameter = baseParameter.replace('-la', '');
						}
						console.log('Mapped base parameter:', baseParameter);
						
						if(this.parameters && this.parameters[baseParameter]) {
							paramTitle = this.parameters[baseParameter].title;
							console.log('Found parameter title:', paramTitle);
						} else {
							console.log('Parameter not found, using default:', paramTitle);
						}
						value = '<strong>'+paramTitle+' '+this.options.key+':</strong> '+(typeof attr.value==="number" ? (dp==0 ? Math.round(attr.value) : attr.value.toFixed(dp)).toLocaleString()+''+(attr.parameter && attr.parameter.units ? '&thinsp;'+attr.parameter.units : '') : '?');
						return popup.replace(/\%VALUE\%/g,value).replace(/\%TITLE\%/g,title); // Replace values
					}
				}
			},
			"primaries":{
				"title":"Primary Substations",
				"source": "primary",
				"layers":[{
					"id": "PRIMARYlayer",
					"heatmap": true,
				}],
				"popup": {
					"text": function(attr){
						var popup,title,dp,value;
						popup = '<h3>%TITLE%</h3><p>%VALUE%</p>';
						title = (attr.properties[attr.name]||'?');
						dp = (typeof attr.parameter.dp==="number" ? attr.parameter.dp : 2);
						if(typeof attr.value!=="number") this.log('WARNING','No numeric value for '+attr.id)
						// Get parameter title from the loaded parameters
						var paramTitle = 'Data';
						if(this.parameters && this.parameters[this.options.parameter]) {
							paramTitle = this.parameters[this.options.parameter].title;
						}
						value = '<strong>'+paramTitle+' '+this.options.key+':</strong> '+(typeof attr.value==="number" ? (dp==0 ? Math.round(attr.value) : attr.value.toFixed(dp)).toLocaleString()+''+(attr.parameter && attr.parameter.units ? '&thinsp;'+attr.parameter.units : '') : '?');
						return popup.replace(/\%VALUE\%/g,value).replace(/\%TITLE\%/g,title); // Replace values
					}
				}
			},
			"primariesLAD":{
				"title":"Primary Substations (with Local Authorities)",
				"source": "primary",
				"layers":[{
					"id":"LADlayer",
					"heatmap": false,
					"boundary":{"color":"#444444","strokeWidth":1,"opacity":0.5,"fillOpacity":0}
				},{
					"id":"PRIMARYlayer",
					"heatmap": true,
				}],
				"popup": {
					"text": function(attr){
						var popup,title,dp,value;
						popup = '<h3>%TITLE%</h3><p>%VALUE%</p>';
						title = (attr.properties[attr.name]||'?');
						dp = (typeof attr.parameter.dp==="number" ? attr.parameter.dp : 2);
						if(typeof attr.value!=="number") this.log('WARNING','No numeric value for '+attr.id)
						// Get parameter title from the loaded parameters
						var paramTitle = 'Data';
						if(this.parameters && this.parameters[this.options.parameter]) {
							paramTitle = this.parameters[this.options.parameter].title;
						}
						value = '<strong>'+paramTitle+' '+this.options.key+':</strong> '+(typeof attr.value==="number" ? (dp==0 ? Math.round(attr.value) : attr.value.toFixed(dp)).toLocaleString()+''+(attr.parameter && attr.parameter.units ? '&thinsp;'+attr.parameter.units : '') : '?');
						return popup.replace(/\%VALUE\%/g,value).replace(/\%TITLE\%/g,title); // Replace values
					}
				}
			}
		},
		"on": {
			"processData": function(data,d,url){
				console.log('processData called with URL:', url);
				console.log('Current scenario:', this.options.scenario);
				console.log('Current parameter:', this.options.parameter);
				console.log('Data key:', data.key);
				console.log('Data file:', data.file);
				console.log('Full data object:', data);
				
				// Handle ENWL CSV files (local files with SPENWL in the name)
				if(url.match(/SPENWL\.csv$/)){
					console.log('Processing ENWL CSV file:', url);
					var rows = d.replace(/[\n\r]+$/,'').split(/\r\n/);
					var r,cols,c,head = {},header = [],orows = new Array(rows.length-1);
					if(rows.length > 1){
						for(r = 0; r < rows.length; r++){
							cols = rows[r].split(/,/);
							if(r==0){
								header = [data.key];
								for(c = 0; c < cols.length; c++){
									head[cols[c]] = c;
									if(cols[c]==parseInt(cols[c])) header.push(parseInt(cols[c]));
								}
								console.log('ENWL CSV header:', header);
							}else{
								orows[r-1] = new Array(header.length);
								for(c = 0; c < header.length; c++){
									id = header[c];
									if(id==data.key){
										v = cols[head[id]].toUpperCase(); // Convert to uppercase to match map data
										console.log('ENWL CSV key conversion:', cols[head[id]], '->', v);
									}else{
										v = cols[head[id]];
										if(parseFloat(v)==v) v = parseFloat(v);
									}
									orows[r-1][c] = v;
								}
							}
						}
						console.log('ENWL CSV processed rows:', orows.length);
					}else{
						this.message('No data loaded from ENWL CSV',{'id':'error','type':'ERROR'});
					}
					// We need to add a "raw" variable that consists of { header: [], rows: [] }
					data.raw = {'rows':orows,'header':header};
					data.col = 0;
				}
				// Handle Northern Powergrid API data
				else if(url.match("https://northernpowergrid.opendatasoft.com/api/explore/v2.1/")){
					var rows = d.replace(/[\n\r]+$/,'').split(/\r\n/);
					var r,cols,c,head = {},header = [],orows = new Array(rows.length-1);
					if(rows.length > 1){
						for(r = 0; r < rows.length; r++){
							cols = rows[r].split(/\;/);
							if(r==0){
								header = [data.key];
								for(c = 0; c < cols.length; c++){
									head[cols[c]] = c;
									if(cols[c]==parseInt(cols[c])) header.push(parseInt(cols[c]));
								}
							}else{
								orows[r-1] = new Array(header.length);
								for(c = 0; c < header.length; c++){
									id = header[c];
									if(id==data.key){
										v = cols[head[id]].toUpperCase();
									}else{
										v = cols[head[id]];
										if(parseFloat(v)==v) v = parseFloat(v);
									}
									orows[r-1][c] = v;
								}
							}
						}
					}else{
						this.message('No data loaded from API',{'id':'error','type':'ERROR'});
					}
					// We need to add a "raw" variable that consists of { header: [], rows: [] }
					data.raw = {'rows':orows,'header':header};
					data.col = 0;
				}
				return data;
			},
			"setScenario": function(){
				if(OI.log) OI.log.add('action=click&content='+this.options.scenario);
			},
			"setParameter": function(){
				if(OI.log) OI.log.add('action=click&content='+this.parameters[this.options.parameter].title);
			},
			"setScale": function(t){
				var abs = document.querySelectorAll("[data-scale='absolute']");
				var rel = document.querySelectorAll("[data-scale='relative']");
				if(abs.length > 0) abs.forEach(function(e){ e.style.display = (t=="absolute") ? '' : 'none'; });
				if(rel.length > 0) rel.forEach(function(e){ e.style.display = (t=="relative") ? '' : 'none'; });
				return this;
			},
			"buildMap": function(){
				var el,div,_obj;
				el = document.querySelector('.leaflet-top.leaflet-left');
				if(el){
					// Does the place search exist?
					if(!el.querySelector('.placesearch')){
						
						_obj = this;

						div = document.createElement('div');
						div.classList.add('leaflet-control','leaflet-bar');
						div.innerHTML = '<div class="placesearch leaflet-button"><button class="submit" href="#" title="Search" role="button" aria-label="Search"></button><form class="placeform layersearch pop-left" action="search" method="GET" autocomplete="off"><input class="place" id="search" name="place" value="" placeholder="Search for a named area" aria-label="Search for a named area" type="text" /><div class="searchresults" id="searchresults"></div></div></form></div>';
						el.appendChild(div);
						
						if("geolocation" in navigator){
							div2 = document.createElement('div');
							div2.classList.add('leaflet-control','leaflet-bar');
							div2.innerHTML = '<div class="geolocate leaflet-button"><button id="geolocate" role="button" title="Centre map on my location" aria-label="Centre map on my location"></button></div>';
							el.appendChild(div2);
							addEv('click',div2,{},function(e){
								var btn = e.currentTarget;
								btn.classList.add('searching');
								navigator.geolocation.getCurrentPosition(function(position){
									_obj.map.panTo({lat: position.coords.latitude, lng: position.coords.longitude});
									btn.classList.remove('searching');
								},function(error){
									_obj.log('ERROR','Sorry, no position available.',`ERROR(${error.code}): ${error.message}`);
								},{
									enableHighAccuracy: true, 
									maximumAge        : 2000, 
									timeout           : 10000
								});
							});
						}

						function toggleActive(state){
							e = el.querySelector('.placesearch');
							if(typeof state!=="boolean") state = !e.classList.contains('typing');
							if(state){
								e.classList.add('typing');
								e.querySelector('input.place').focus();
							}else{
								e.classList.remove('typing');
							}
						}
					
						div.querySelector('.submit').addEventListener('click', function(e){ toggleActive(); });

						// Stop map dragging on the element
						el.addEventListener('mousedown', function(){ _obj.map.dragging.disable(); });
						el.addEventListener('mouseup', function(){ _obj.map.dragging.enable(); });

						// Define a function for scoring how well a string matches
						function getScore(str1,str2,v1,v2,v3){
							var r = 0;
							str1 = str1.toUpperCase();
							str2 = str2.toUpperCase();
							if(str1.indexOf(str2)==0) r += (v1||3);
							if(str1.indexOf(str2)>0) r += (v2||1);
							if(str1==str2) r += (v3||4);
							return r;
						}
						this.search = TypeAhead.init('#search',{
							'items': [],
							'render': function(d){
								// Construct the label shown in the drop down list
								return d['name']+(d['type'] ? ' ('+d['type']+')':'');
							},
							'rank': function(d,str){
								// Calculate the weight to add to this airport
								var r = 0;
								if(postcodes[postcode] && postcodes[postcode].data){
									_obj.log(d,d.id,postcodes[postcode].data.attributes.lep1);
									if(d.layer=="PRIMARYlayer"){
										if(d.id == matchedprimary){
											r += 10;
										}
									}else{
										for(var cd in postcodes[postcode].data.attributes){
											if(postcodes[postcode].data.attributes[cd]==d.id){
												r += 1;
											}
										}
									}
								}
								if(d['name']) r += getScore(d['name'],str);
								if(d['id']) r += getScore(d['name'],str);
								return r;
							},
							'process': function(d){
								// Format the result
								var l,ly,key,i;
								l = d['layer'];
								ly = _obj.layers[l].layer;
								key = _obj.layers[l].key;
								for(i in ly._layers){
									if(ly._layers[i].feature.properties[key]==d['id']){

										// Zoom to feature
										_obj.map.fitBounds(ly._layers[i]._bounds,{'padding':[5,5]});

										// Open the popup for this feature
										ly.getLayer(i).openPopup();
										
										// Change active state
										toggleActive(false);
									}
								}
							}
						});
						var postcode = "";
						var postcodes = {};
						var regex = new RegExp(/^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([AZa-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z]))))[0-9][A-Za-z]{2})$/);
						var matchedprimary = "";
						this.search.on('change',{'me':this.search},function(e){
							var v = e.target.value.replace(/ /g,"");
							var m = v.match(regex)||[];
							if(m.length){
								_obj.log('INFO','Looks like a postcode',m[0]);
								postcode = m[0];
								if(!postcodes[m[0]]){
									postcodes[m[0]] = {};
									AJAX('https://findthatpostcode.uk/postcodes/'+m[0]+'.json',{
										'dataType':'json',
										'postcode':m[0],
										'this': e.data.me,
										'success': function(data,attr){
											postcodes[attr.postcode] = data;
											matchedprimary = findPrimary(_obj,data);
											this.update();
										}
									});
								}else{
									if(postcodes[m[0]].data) matchedprimary = findPrimary(_obj,postcodes[m[0]]);
								}
							}else postcode = "";
						});
					}
					function findPrimary(_obj,data){
						var matched,j,l,i,geojson;
						// Loop through layers
						for(j = 0; j < _obj.views[_obj.options.view].layers.length; j++){
							l = _obj.views[_obj.options.view].layers[j].id;
							// If the layer is PRIMARYlayer we see if we can match a polygon
							if(l=="PRIMARYlayer"){
								geojson = L.geoJSON(_obj.layers[l].geojson);
								matched = leafletPip.pointInLayer([data.data.attributes.long,data.data.attributes.lat],geojson);
								if(matched.length==1) return matched[0].feature.properties[_obj.layers[l].name];
							}
						}
						return "";
					}
					if(this.search){
						var l,f,i,j,name,code;
						this.search._added = {};
						this.search.clearItems();
						for(j = 0; j < this.views[this.options.view].layers.length; j++){
							l = this.views[this.options.view].layers[j].id;
							name = this.layers[l].name;
							code = this.layers[l].key;
							if(this.layers[l].geojson && this.layers[l].geojson.features && code && name){
								// If we haven't already processed this layer we do so now
								if(!this.search._added[l]){
									f = this.layers[l].geojson.features;
									for(i = 0; i < f.length; i++) this.search.addItems({'name':f[i].properties[name]||"?",'id':f[i].properties[code]||"",'i':i,'layer':l});
									this.search._added[l] = true;
								}
							}
						}
					}
				}
			}
		}
	});



	// Add download button
	if(document.getElementById('download-csv')){
		addEv('click',document.getElementById('download-csv'),{me:dfes},function(e){
			e.preventDefault();
			e.stopPropagation();
			var csv = "";
			var opt = e.data.me.options;
			var filename = ("DFES-2022--{{scenario}}--{{parameter}}--{{view}}.csv").replace(/\{\{([^\}]+)\}\}/g,function(m,p1){ return (opt[p1]||"").replace(/[ ]/g,"_") });
			var values,r,rs,y,v,l,layerid,p,ky,nm;
			values = e.data.me.data.scenarios[e.data.me.options.scenario].data[e.data.me.options.parameter].layers[e.data.me.options.view].values;
			v = e.data.me.options.view;
			layerid = '';
			// We need to loop over the view's layers
			for(l = 0; l < e.data.me.views[v].layers.length; l++){
				if(e.data.me.views[v].layers[l].heatmap) layerid = l;
			}
			ky = e.data.me.layers[e.data.me.views[v].layers[layerid].id].key;
			nm = e.data.me.layers[e.data.me.views[v].layers[layerid].id].name;
			if(typeof ky==="undefined") console.warn('No key provided for this layer in the layers structure.');
			if(typeof nm==="undefined") console.warn('No name provided for this layer in the layers structure.');

			rs = Object.keys(values).sort();
			csv = ky.toUpperCase()+','+e.data.me.views[v].title;
			for(y = e.data.me.options.years.min; y <= e.data.me.options.years.max; y++) csv += ','+y+(e.data.me.parameters[e.data.me.options.parameter] && e.data.me.parameters[e.data.me.options.parameter].units ? ' ('+e.data.me.parameters[e.data.me.options.parameter].units+')' : '');
			csv += '\n';
			for(i = 0; i < rs.length; i++){
				r = rs[i];
				p = getGeoJSONPropertiesByKeyValue(e.data.me.layers[e.data.me.views[v].layers[layerid].id].geojson,ky,r);
				csv += r;
				csv += ',';
				csv += (typeof nm==="string" && p[nm] ? (p[nm].match(',') ? '"'+p[nm]+'"' : p[nm]) : "?");
				for(y = e.data.me.options.years.min; y <= e.data.me.options.years.max; y++){
					csv += ',';
					if(typeof values[r][y]==="number") csv += (typeof e.data.me.parameters[e.data.me.options.parameter].dp==="number" ? values[r][y].toFixed(e.data.me.parameters[e.data.me.options.parameter].dp) : values[r][y]);
				}
				csv += '\n'
			}
			saveToFile(csv,filename,'text/plain');
		});
	}
	function saveToFile(txt,fileNameToSaveAs,mime){
		// Bail out if there is no Blob function
		if(typeof Blob!=="function") return this;

		var textFileAsBlob = new Blob([txt], {type:(mime||'text/plain')});

		function destroyClickedElement(event){ document.body.removeChild(event.target); }

		var dl = document.createElement("a");
		dl.download = fileNameToSaveAs;
		dl.innerHTML = "Download File";

		if(window.webkitURL != null){
			// Chrome allows the link to be clicked without actually adding it to the DOM.
			dl.href = window.webkitURL.createObjectURL(textFileAsBlob);
		}else{
			// Firefox requires the link to be added to the DOM before it can be clicked.
			dl.href = window.URL.createObjectURL(textFileAsBlob);
			dl.onclick = destroyClickedElement;
			dl.style.display = "none";
			document.body.appendChild(dl);
		}
		dl.click();
	}
	function getGeoJSONPropertiesByKeyValue(geojson,key,value){
		if(!geojson.features || typeof geojson.features!=="object"){
			fes.log('WARNING','Invalid GeoJSON',geojson);
			return {};
		}
		for(var i = 0; i < geojson.features.length; i++){
			if(geojson.features[i].properties[key] == value) return geojson.features[i].properties;
		}
		return {};
	};
	function getGeoJSONPropertyValue(l,value){
		if(!fes.layers[l].key){
			fes.log('WARNING','No key set for layer '+l);
			return "";
		}
		if(fes.layers[l] && fes.layers[l].geojson){
			key = (fes.layers[l].name||fes.layers[l].key);
			for(var i = 0; i < fes.layers[l].geojson.features.length; i++){
				if(fes.layers[l].geojson.features[i].properties[fes.layers[l].key] == value) return fes.layers[l].geojson.features[i].properties[key];
			}
			return "";
		}else return "";
	};

});
