
module powerbi.extensibility.visual {
    let $head = $('head');
    $head.append('<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.5/leaflet.css" type="text/css" />');
    $head.append('<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.5/leaflet.js"></script>');

    export class LeafletMap implements IVisual {
        private dataView: DataView;
        private map: L.Map;
        private basemap: L.TileLayer;

        constructor(options: VisualConstructorOptions) {
            console.log('constructor called');
            let $mapDiv = $('<div></div>')
                .attr('id', 'map')
                .css('height', 500)
                .css('width', 700);

            $(options.element).append($mapDiv);

            this.basemap = L.tileLayer('https://d5nra9v0s4zer.cloudfront.net/base-tiles-2016/{z}/{y}/{x}');

            this.map = L.map('map', {
                center: new L.LatLng(56.7050482, -111.4407939),
                zoom: 12,
                maxZoom: 18,
                minZoom: 12
            });

            this.map.addLayer(this.basemap);
        }

        public static converter(dataView: DataView) {
            const {columns, rows} = dataView.table;
            const c20 = d3.scale.category10();

            const datas = rows.map(function (row) {
                let data = row.reduce(function (d, v, i) {
                    d[columns[i].displayName] = v;
                    return d;
                }, {});

                data.color = c20(data.category);

                return data;
            });

            return datas;
        }

        public update(options: VisualUpdateOptions) {
            console.log('update called');
            
            if (!options.dataViews && !options.dataViews[0]) return;
            this.dataView = options.dataViews[0];
            const data = LeafletMap.converter(this.dataView);

            const markers = data.map(function (d) {
                const latlng = L.latLng([d.latitude, d.longitude]);
                return L.circleMarker(latlng, {color: d.color, fillOpacity: 1});
            });

            const markerLayer = L.layerGroup(markers);

            this.map.addLayer(markerLayer);

            $('#map')
                .css('height', options.viewport.height)
                .css('width', options.viewport.width);

            this.map.invalidateSize(true);
        }

        public destroy() {
            console.log('destroy called');
            this.map.remove();
        }
    }
}
