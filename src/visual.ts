/*
 *  Power BI Visualizations
 *
 *  Copyright (c) David Eldersveld, BlueGranite Inc.
 *  All rights reserved. 
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *   
 *  The above copyright notice and this permission notice shall be included in 
 *  all copies or substantial portions of the Software.
 *   
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

/*
LEAFLET License obtained from: https://github.com/Leaflet/Leaflet/blob/master/LICENSE
 
Copyright (c) 2010-2015, Vladimir Agafonkin
Copyright (c) 2010-2011, CloudMade
All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are
permitted provided that the following conditions are met:
   1. Redistributions of source code must retain the above copyright notice, this list of
      conditions and the following disclaimer.
   2. Redistributions in binary form must reproduce the above copyright notice, this list
      of conditions and the following disclaimer in the documentation and/or other materials
      provided with the distribution.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


module powerbi.extensibility.visual {

    //TEMPORARY
    //Add Leaflet JS and CSS from CDN for now. Add to solution in the long term.
    var l = document.createElement('link');
    l.type = 'text/css';
    l.rel = 'stylesheet';
    l.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.5/leaflet.css';
    //l.async = false;
    l.onload = function () {
        window.console.log('Leaflet CSS loaded');
    };
    document.head.appendChild(l);

    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.5/leaflet.js';
    s.async = false;
    s.onload = function () {
        window.console.log('Leaflet JS loaded');
    };
    document.head.appendChild(s);
    //END TEMPORARY

    //import SelectionManager = utility.SelectionManager;

    export interface GeoDatapoint {
        geoType: string;
        geoData: any;
        //description: string;
        dataValue: number;
        lng: number;
        lat: number;
    }

    export class LeafletMap implements IVisual {

        //private selectionManager: SelectionManager;
        private dataView: DataView;

        public static createMap(baseTiles, shapes): any {
            var map = L.map('map', {
                center: new L.LatLng(20, -10),
                minZoom: 1,
                zoom: 2,
                layers: [baseTiles.Default, shapes.Polygons, shapes.Linestrings, shapes.Points]
            });

            return map;
        }

        public static getBaseTiles(): any {

            var defaultOSM = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            });

            var cartoDBDark = L.tileLayer('http://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
                attribution: 'Map tiles by CartoDB, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
            });

            var cartoDBLight = L.tileLayer('http://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
                attribution: 'Map tiles by CartoDB, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
            });

            var stamenToner = L.tileLayer('http://a.tile.stamen.com/toner/{z}/{x}/{y}.png', {
                attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
            });

            var stamenWatercolor = L.tileLayer('http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', {
                attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
            });

            var emptyTile = L.tileLayer('', {
                attribution: 'Absence of map tiles by David Eldersveld'
            });

            var customImageUrl = 'https://i-msdn.sec.s-msft.com/dynimg/IC819671.png';
            var southWest = L.latLng(45.5, -89);
            var northEast = L.latLng(42, -80);
            var customImageBounds = L.latLngBounds(southWest, northEast);
            var customImage = L.imageOverlay(customImageUrl, customImageBounds, { opacity: .5 });

            var baseTileType = {
                "Default": defaultOSM,
                "Dark": cartoDBDark,
                "Light": cartoDBLight,
                "Toner": stamenToner,
                "Watercolor": stamenWatercolor,
                "Custom": customImage,
                "None": emptyTile
            };

            return baseTileType;
        }

        public static drawShapes(map, cartoData, radiusOption, bubbleAreaScale, pointFillOption, lineFillOption, lineWidthOption, polygonFillOption, colorScale): any {
            console.log('Leaflet Map: draw/check markers and polys');

            var points = [];
            var lines = [];
            var polygons = [];

            var circleMarkerOptions = {
                radius: radiusOption,
                stroke: true,
                opacity: .8,
                weight: 1,
                color: "rgb(244,244,244)",
                fill: true,
                fillOpacity: .6,
                fillColor: pointFillOption
            };

            var polylineOptions = {
                lineCap: "round",
                lineJoin: "round",
                stroke: true,
                color: lineFillOption,
                opacity: .95,
                weight: lineWidthOption,
                fill: false
            };

            var polygonOptions = {
                lineCap: "round",
                lineJoin: "round",
                stroke: true,
                color: "rgb(244,244,244)",
                opacity: .8,
                weight: 1,
                fill: true,
                fillOpacity: .6,
                fillColor: polygonFillOption
            };

            for (var i in cartoData) {
                //console.log(radiusOption);

                //compute radius for bubble based on area
                if (radiusOption === -1) {
                    circleMarkerOptions["radius"] = Math.sqrt(bubbleAreaScale(cartoData[i].dataValue) / Math.PI);
                }

                //console.log(cartoData[i]);
                //WKT POINT as circleMarker
                if (cartoData[i].geoType === "POINT") {
                    //console.log("adding circle marker at " + cartoData[i].geoData);
                    points.push(L.circleMarker(cartoData[i].geoData, circleMarkerOptions)
                        .bindPopup(L.popup()
                            .setContent(//"Description: <br>" + cartoData[i].description +
                                "Latitude: " + cartoData[i].lat +
                                "<br>Longitude: " + cartoData[i].lng +
                                "<br>Value: " + cartoData[i].dataValue)
                            )
                        .on('mouseover', function (e) {
                            this.openPopup();
                        })
                        );
                }
                else if (cartoData[i].geoType === "LINESTRING") {
                    //console.log("adding polyline at " + cartoData[i].geoData);
                    //console.log(cartoData[i].geoData);
                    lines.push(L.polyline(cartoData[i].geoData, polylineOptions));
                }
                else if (cartoData[i].geoType === ("POLYGON")) {
                    polygonOptions["fillColor"] = colorScale(cartoData[i].dataValue);
                    //console.log("adding polygon at " + cartoData[i].geoData);
                    polygons.push(L.polygon(cartoData[i].geoData, polygonOptions));
                }
            }

            var pointGroup = new L.FeatureGroup(points);
            var lineGroup = new L.FeatureGroup(lines);
            var polygonGroup = new L.FeatureGroup(polygons);

            var shapes = {
                "Points": pointGroup,
                "Linestrings": lineGroup,
                "Polygons": polygonGroup
            };

            return shapes;
        }

        public static capabilities: VisualCapabilities = {
            dataRoles: [
                {
                    name: "Category",
                    kind: VisualDataRoleKind.Grouping,
                    displayName: "Custom Geography"
                },
                //{
                //    name: "Description",
                //    kind: VisualDataRoleKind.Grouping,
                //    displayName: "Description"
                //},
                {
                    name: "Value",
                    kind: VisualDataRoleKind.Measure
                }
            ],
            dataViewMappings: [{
                categorical: {
                    categories: {
                        for: { in: "Category" }
                    },
                    values: {
                        select: [
                            //{ bind: { to: 'Description' } },
                            { bind: { to: 'Value' } }
                        ]
                    },
                }
            }],
            objects: {
                general: {
                    displayName: 'test',
                    //displayName: data.createDisplayNameGetter('Visual_General'),
                    properties: {
                        formatString: {
                            type: { formatting: { formatString: true } },
                        },
                        pointFill: {
                            type: { fill: { solid: { color: true } } },
                            displayName: 'Point color'
                        },
                        pointRadius: {
                            type: { numeric: true },
                            displayName: 'Point radius'
                        },
                        lineFill: {
                            type: { fill: { solid: { color: true } } },
                            displayName: 'Line color'
                        },
                        lineWidth: {
                            type: { numeric: true },
                            displayName: 'Line width'
                        },
                        polygonFill: {
                            type: { fill: { solid: { color: true } } },
                            displayName: 'Polygon color'
                        },
                    },
                },
            }
        };

        //private element: JQuery;

        public static converter(dataView: DataView): GeoDatapoint[] {
            console.log('converter');
            console.log(dataView);

            function parsePoint(wkt) {
                var replaceWhite = wkt.replace(/[ ]+/g, ",");
                var removeNonNumeric = replaceWhite.replace(/[^0-9.,-]/g, "");
                var pushToArray = removeNonNumeric.split(",");
                var reversed = pushToArray.reverse();
                //console.log('reversed WKT: ' + reversed);
                var newLLatLng = new L.LatLng(parseFloat(reversed[0]), parseFloat(reversed[1]));
                //console.log('L.LatLng: ' + newLLatLng);

                return newLLatLng;
            }

            function parseLineString(wkt) {
                var newLine = [];
                var replaceLeadingWhite = wkt.replace(/@[ (]/g, "");
                var replaceTrailingWhite = replaceLeadingWhite.replace(/@[ )]/g, "");
                var replaceWhite = replaceTrailingWhite.replace(/[ ]+/g, ",");
                var removeNonNumeric = replaceWhite.replace(/[^0-9.,-]/g, "");
                var pushToArray = removeNonNumeric.split(",");
                var reversed = pushToArray.reverse();
                //console.log('reversed WKT: ' + reversed);
                reversed = reversed.filter(function (n) { return n !== ""; });
                //console.log('cleaned WKT: ' + reversed);
                for (var i = 0; i < reversed.length * 2; i++) {
                    var test = null;
                    var coordTest = reversed.pop();
                    var lng = coordTest;
                    var lat = reversed.pop();

                    test = new L.LatLng(parseFloat(lat), parseFloat(lng));
                    //console.log('created new L.LatLng for linestring');
                    //console.log(test);
                    //console.log(reversed);

                    if (test !== null) {
                        newLine.push(test);
                        test = null;
                    }
                }

                return newLine;
            }

            //var sampleDataWKT = [
            //    { location: "POINT (-83.737793 42.3016903)" },
            //    { location: "POINT(-84.473877 42.7591128)" },
            //    { location: "LINESTRING (-84.7348022 42.206142, -83.4054565 42.946371 )" },
            //    { location: "POLYGON(( -84.3722534 42.2366519, -83.6178007 42.219841, -83.5308655 42.43415970000001, -83.932994 42.4538213, -84.3722534 42.2366519 ))" }
            //];

            //var data = sampleDataWKT;
            var data = dataView.table.rows;
            var dataPoints: GeoDatapoint[] = [];

            for (var i in data) {

                //console.log('initial WKT: ' + data[i]);
                //console.log(data[i][0].substr(0, 3));

                var wktTypeCheck = data[i][0].substr(0, 3);
                switch (wktTypeCheck) {
                    case "POI":
                        //console.log('type check = point');
                        var pointData = parsePoint(data[i][0]);
                        dataPoints.push({
                            geoType: "POINT",
                            geoData: pointData,
                            //description: "Test",
                            dataValue: data[i][1],
                            lng: pointData.lng,
                            lat: pointData.lat
                        });
                        break;
                    case "LIN":
                        //console.log('type check = linestring');
                        var lineData = parseLineString(data[i][0]);
                        dataPoints.push({
                            geoType: "LINESTRING",
                            geoData: lineData,
                            //description: "",
                            dataValue: data[i][1],
                            lng: 0,
                            lat: 0
                        });
                        break;
                    case "POL":
                        //console.log('type check = polygon');
                        var polygonData = parseLineString(data[i][0]);
                        dataPoints.push({
                            geoType: "POLYGON",
                            geoData: polygonData,
                            //description: "",
                            dataValue: data[i][1],
                            lng: 0,
                            lat: 0
                        });
                        break;
                }
            }

            //console.log(dataPoints);
            return dataPoints;
        }

        constructor(options: VisualConstructorOptions) {
            console.log('adding div to', options.element);
            d3.select(options.element).append("div")
                .attr('id', 'map');

            //works with a jQuery select by not D3 select?
            //CSS required in both init() and update() for tiles to load properly
            // TODO: viewport is not a property on VisualConstructorOptions
            // it can be added, but that is a hack on the powerbi-visuals api
            $("#map")
                .css("height", 500)
                .css("width", 700);

        }

        public update(options: VisualUpdateOptions) {
            if (!options.dataViews && !options.dataViews[0]) return;
            this.dataView = options.dataViews[0];
            var cartoData = LeafletMap.converter(this.dataView);

            //works with a jQuery select by not D3 select?
            //CSS required in both init() and update() for tiles to load properly
            $("#map")
                .css("height", options.viewport.height)
                .css("width", options.viewport.width);

            var pointFillOption = this.getFill(this.dataView, "point").solid.color;
            var lineFillOption = this.getFill(this.dataView, "line").solid.color;
            var polygonFillOption = this.getFill(this.dataView, "polygon").solid.color;
            var radiusOption = this.getPointRadius(this.dataView);
            var lineWidthOption = this.getLineWidth(this.dataView);

            var colorScale = d3.scale.linear()
                .domain(d3.extent(cartoData, function (d) {
                    if (d.geoType === "POLYGON") {
                        return d.dataValue;
                    }
                })).nice()
                .range(["rgb(233, 233, 233)", polygonFillOption])
                .interpolate(d3.interpolateLab);

            var bubbleAreaScale = d3.scale.linear()
                .domain([0, d3.max(cartoData, function (d) {
                    //console.log(d);
                    if (d.geoType === "POINT") {
                        return d.dataValue;
                    }
                })]).nice()
                .range([6 * Math.PI, 100 * Math.PI]);

            var baseTiles = LeafletMap.getBaseTiles();
            var shapes = LeafletMap.drawShapes(map, cartoData, radiusOption, bubbleAreaScale, pointFillOption, lineFillOption, lineWidthOption, polygonFillOption, colorScale);
            var map = LeafletMap.createMap(baseTiles, shapes);

            L.control.layers(baseTiles, shapes).addTo(map);

            var pointGroup = shapes.Points;
            var pointBounds = pointGroup.getBounds();
            map.fitBounds(pointBounds);
            map.zoomOut(1);
            
            //add choropleth legend control + CSS
            //var polygonCount = 0;
            //for (var i in cartoData) {
            //    if (cartoData[i].geoType === "POLYGON") {
            //        polygonCount += 1;
            //    }
            //}
            //if (polygonCount > 0) {
            //    var legend = L.control({ position: 'bottomright' });
            //    legend.onAdd = function (map) {
            //        var min = d3.min(cartoData, function (d) {
            //            if (d.geoType === "POLYGON") {
            //                return d.dataValue;
            //            }
            //        });
            //        var max = d3.max(cartoData, function (d) {
            //            if (d.geoType === "POLYGON") {
            //                return d.dataValue;
            //            }
            //        });
            //        var div = L.DomUtil.create('div', 'info legend');
            //        var grades = [Math.floor(min),
            //            Math.floor((max - min) * (1 / 3) + min),
            //            Math.floor((max - min) * (2 / 3) + min),
            //            Math.floor(max)
            //        ];
            //        for (var i = 0; i < grades.length; i++) {
            //            div.innerHTML +=
            //            '<i style="background:' + colorScale(grades[i] + 1) + '"></i> ' +
            //            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            //        }
            //        return div;
            //    };

            //    legend.addTo(map);

            //    $(".legend")
            //        .css("line-height", "18px")
            //        .css("color", "rgb(0, 0, 0)")
            //        .css("background-color", "rgb(255, 255, 255)");
            //    $(".legend i")
            //        .css("width", "18px")
            //        .css("height", "18px")
            //        .css("float", "left")
            //        .css("margin-right", "8px")
            //        .css("opacity", .7);
            //}
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
            var instances: VisualObjectInstance[] = [];
            switch (options.objectName) {
                case 'general':
                    var general: VisualObjectInstance = {
                        objectName: 'general',
                        displayName: 'General',
                        selector: null,
                        properties: {
                            pointFill: this.getFill(this.dataView, "point"),
                            pointRadius: this.getPointRadius(this.dataView),
                            lineFill: this.getFill(this.dataView, "line"),
                            lineWidth: this.getLineWidth(this.dataView),
                            polygonFill: this.getFill(this.dataView, "polygon")
                        }
                    };
                    instances.push(general);
                    break;
            }

            return instances;
        }

        private getPointRadius(dataView: DataView): number {
            if (dataView && dataView.metadata.objects) {
                var general = dataView.metadata.objects['general'];
                if (general) {
                    return <number>general['pointRadius'];
                }
            }
            return 5;
        }

        private getLineWidth(dataView: DataView): number {
            if (dataView && dataView.metadata.objects) {
                var general = dataView.metadata.objects['general'];
                if (general) {
                    return <number>general['lineWidth'];
                }
            }
            return 5;
        }

        private getFill(dataView: DataView, fillType): Fill {
            if (dataView && dataView.metadata.objects) {
                var general = dataView.metadata.objects['general'];
                if (fillType === "point") {
                    return <Fill>general['pointFill'];
                }
                else if (fillType === "line") {
                    return <Fill>general['lineFill'];
                }
                else if (fillType === "polygon") {
                    return <Fill>general['polygonFill'];
                }
            }
            return { solid: { color: 'rgb(1, 184, 170)' } };
        }

        public destroy() {
            $("#map").remove;
        }
    }
}
