var points = [];
var markers = [];
var nodes = [];
var nodehtmls = [];
var count = 0;
var sidehtml="";
var map = null;
var xmlDoc = null;
var loader = null;
var bounds = L.latLngBounds();

var clickId;
var lastClick = -1;

// Set a hash table and sort out the multiple listings
var keycounts = [];

// Highlight the table row in the sidepanel...activated from the click inside the marker info window
function highlight(a) {
  if (lastClick != -1) {
    document.getElementById(lastClick).style.background = "none";
  }
  document.getElementById(a).style.background = "#C6DAFF";
  document.getElementById(a).scrollIntoView(false);
  lastClick = a;
}

function hash(lng, lat)	{
  return(lng + ":" + lat);
}

function addPoints() { }

// This function picks up the click and opens the corresponding info window
function findMarker(i) {
  var marker = markers[i];

  console.log(marker.html);

  map.setView(marker.getLatLng(), 8);
  map.openPopup(marker.html, marker.getLatLng());
}

// Call this function from body onLoad event in html output
function load() {
  var mapOptions = {
    center: L.latLng([10, 0]),
    zoom: 2
  };
  map = L.map("map", mapOptions);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Load MLoader with document elements
  loader = new MLoader(map, document.getElementById("loading"), document.getElementById("loadingText"), document.getElementById("bar"), document.getElementById("fill"), document.getElementById("loadingButton"), document.getElementById("tally"));
  loader.show("Loading Data", true);
  getXmlFile();
}

// This function creates the map markers.
function createMarker(point, key, titleValue, mhtml, ihtml, cId, simtitle, loc, postdate) {
  var imgclass = 'Single Position';

  mhtml = '<div class="infowindow"><b>This point has ' + keycounts[key] + ' listings.</b><br/><div style="overflow:auto; max-height:250px; width:260px">' + mhtml + '</div></div>';
  ihtml = '<div class="infowindow"><div style="overflow:auto; max-height:250px; width:260px">' + ihtml + '</div></div>';

  if (keycounts[key] == 1) {

    // Single Listing.
    var icon = L.icon({
      iconUrl: "icons/gjc" + count + ".png",
      iconSize: [25, 25],
      iconAnchor: [12, 0]
    });
    var marker = L.marker(point, {icon: icon, title: simtitle}).addTo(map).bindPopup(ihtml);
   
  } else {

    // Multiple Listings.
    var icon = L.icon({
      iconUrl: "icons/gjcm.png",
      iconSize: [25, 25],
      iconAnchor: [12, 0]
    });
    var marker = L.marker(point, {icon: icon, title: "Multiple Jobs"}).addTo(map).bindPopup(mhtml);    
  }
  marker.html = ihtml; // for side HTML "map it"

  points[cId] = point;
  markers[cId] = marker;

  sidehtml += '<tr id="' + cId + '" onMouseOver="headerOver(\'' + cId + '\')" onMouseOut="headerOut(\'' + cId + '\')">';
  sidehtml += '<td valign="top" width="35" align="center" style="padding-bottom:10px; padding-top:10px; border-bottom: 1px solid #999999"><div class="header" title="' + imgclass + '">' + count + '.</div></td>';
  sidehtml += '<td style="padding-bottom:10px; padding-top:10px; border-bottom: 1px solid #999999" valign="top">';
  sidehtml += '<b>' + titleValue + '</b> <img src="new-window.gif" alt="Open in New Window" title="Open in New Window" /><br/>';
  sidehtml += '<span style="color:#555555;font-weight:normal">Location: ' + loc + '</span><br/>';
  sidehtml += '<a href="javascript:highlight(\'' + cId + '\');findMarker(\'' + cId + '\')" title="Map It" style="float:right">Map It</a>';
  sidehtml += '<span style="color:#555555;font-weight:normal">Posted: ' + postdate + '</span><br/>';
  sidehtml += '</td></tr>';	

  // i++;

  return marker;
}
	
function getXmlFile() {
  document.getElementById("loadingText").innerHTML = "Please Wait...<br>Parsing Data from Web Service";
  document.getElementById("bar").style.display = "none";
  document.getElementById("fill").style.display = "none";
  document.getElementById("tally").style.display = "none";
  document.getElementById("loadingButton").style.display = "none";

  $.ajax({
    type: "GET",
    dataType: "xml",
    url: "/cgi-bin/kmljobs.pl",
    success: function(data) {
      xmlDoc = data;
      processXMLfile();
    },
    error: function() {
      alert("Error fetching KML data.");
    }
  });
}

// This function processes the KML file and calls the createmarker function...
function processXMLfile() {

  if (xmlDoc) {
    document.getElementById("loadingText").innerHTML = "Loading Data";
    document.getElementById("bar").style.display = "block";
    document.getElementById("fill").style.display = "block";
    document.getElementById("tally").style.display = "block";
    document.getElementById("loadingButton").style.display = "block";

    if (!xmlDoc.documentElement) {
      alert("invalid xml file - no documentElement");
    }
			
    // Update Body title and page title in mhtml
    var bodytitle = xmlDoc.documentElement.getElementsByTagName("Document")[0].getElementsByTagName("name")[0];
    // document.getElementById("bodytitle").innerHTML = bodytitle.firstChild.nodeValue;
    // document.title = bodytitle.firstChild.nodeValue;
				
    var coords = xmlDoc.documentElement.getElementsByTagName("coordinates");

    var recCount = coords.length;
				
    // Populate the hash table
    for (var i = 0; i < recCount; i++) {
      var points = coords[i].firstChild.nodeValue;
      var pointsArray = points.split(",");
      var key = hash(parseFloat(pointsArray[0]), parseFloat(pointsArray[1]));      
      if (keycounts[key]) keycounts[key]++;
      else (keycounts[key]) = 1;
    }

    var places = xmlDoc.documentElement.getElementsByTagName("Placemark");
				
    for (var i=0; i<recCount; i++) {
      var points = coords[i].firstChild.nodeValue;
      var pointsArray = points.split(",");

      // Check to see if the lat/lng are set.  If the point element has a lat/lng, then process the data and create the marker...
      if (pointsArray[0] != 0 && pointsArray[1] != 0) {
        var lng = parseFloat(pointsArray[0]);
        var lat = parseFloat(pointsArray[1]);

        var key  = hash(lng, lat);
        var point = L.latLng([lat, lng]);

        // Variables for html from xml
        var title = places[i].getElementsByTagName("name")[0].firstChild.nodeValue;
        var desc  = places[i].getElementsByTagName("description")[0].firstChild.nodeValue;
        var pretitle = places[i].getElementsByTagName("name")[0].getAttribute("_gxtitle");
        var simtitle = places[i].getAttribute("_gxbasetitle");
        var loc = places[i].getAttribute("_gxlocation");
        var postdate = places[i].getAttribute("_gxpostdate");
        var recid = places[i].getAttribute("_gxid");

        desc = desc.replace("<table>", "");
        desc = desc.replace("</table>", "");
							
        // html for the info window
        var ihtml = '<table border="0" cellspacing="0" cellpadding="4" class="infoWindow">';
        ihtml += '<tr><td class="title"><b>' + pretitle + ':</b></td><td class="title"><b>' + title +'</b></td></tr>';
        ihtml += desc;
        ihtml += '</table>';
					
        var mhtml = "";
					
        clickId = recid;
							
        // If there are multiple listings at the same location then add the key to the nodes array and the ihtml string to the nodehtmls array.
        if (keycounts[key] != 1) {
          nodes.push(key);
          nodehtmls.push('<div onClick = highlight("' + clickId + '") style="cursor: pointer; padding:3px; margin:3px; border: 1px solid #999999;">'+ ihtml +'</div>');
        }
						
        // Add the mhtml string from the array to the mhtml variable.  The mhtml variable will be reset after each iteration of the items.length for loop;
        for (var q = 0; q < nodes.length; q++) {
          if (nodes[q] == key) {
            mhtml += nodehtmls[q];	
          } 
        }

        count++;

        var marker = createMarker(point, key, title, mhtml, ihtml, clickId, simtitle, loc, postdate);
        loader.add(i, addPoints, marker); // send data to loader
        bounds.extend(point);
      }
    }	

    document.getElementById("infopanel").innerHTML = '<h2 style="padding-left:0px; padding-top:0px">Jobs</h2>Click on an item below to see data on the map:<br>('+ count +' total records are mapped)<br><table class="title" cellspacing="0" style="width:95%">' + sidehtml +'</table>';
							
    // Start progress bar
    loader.execute();
							
    if (setLat != 0 && setLng != 0 && setZoom > -1) {
      var userCenter = L.latLng([setLat, setLng]);
      map.setCenter(userCenter, setZoom);
    } else {
      // Set the map bounds based on the data that have been added...this guarantees that all points and the appropriate zoom are displayed every time
      map.fitBounds(bounds);
    }
		
  } else {
    alert("XML Feed Not Found");
    return;
  }
} 

// Toggle the Info Panel
function togglePanel(dir) {
  var a = document.getElementById("infopanel");
  var b = document.getElementById("mainmap");
  var c = document.getElementById("hidearrow");
  var d = document.getElementById("showarrow");
  var e = document.getElementById("map_overview");

  // If the map hides the infopanel on the LEFT...
  if (dir == "left") {
    if (a.style.display != 'none') {
      a.style.display = 'none';
      b.style.left = '0px';
      c.style.display = 'none';
      d.style.display = 'block';
      map.invalidateSize(); // google.maps.event.trigger(map, 'resize');
    } else {
      a.style.display = 'block';
      b.style.left = '35%';
      c.style.display = 'block';
      d.style.display = 'none';
      map.invalidateSize(); // google.maps.event.trigger(map, 'resize');
    }
  }

  // If the map hides the infopanel on the RIGHT...
  if (dir == "right") {
    if (a.style.display != 'none') {
      a.style.display = 'none';
      b.style.right = '0px';
      c.style.display = 'none';
      d.style.display = 'block';
      map.invalidateSize(); // google.maps.event.trigger(map, 'resize');
    } else {
      a.style.display = 'block';
      b.style.right = '35%';
      c.style.display = 'block';
      d.style.display = 'none';
      map.invalidateSize(); // google.maps.event.trigger(map, 'resize');
    }
  }
}

function headerOver(selId) {
  if (lastClick != selId) {
    document.getElementById(selId).style.background = "#F1F6FF";
  }
}

function headerOut(selId) {
  if (lastClick != selId) {
    document.getElementById(selId).style.background = "none";
  }
}

function tHelp(hType) {
  if (hType == "show") {
    document.getElementById('help-wrapper').style.display = "block";
  } else {
    document.getElementById('help-wrapper').style.display = "none";
  }
}
