
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
            var mapDiv = $('<div></div>')
                .attr('id', 'map')
                .css('height', 500)
                .css('width', 700);
            $(options.element).append(mapDiv);

            this.basemap = L.tileLayer('https://d5nra9v0s4zer.cloudfront.net/base-tiles-2016/{z}/{y}/{x}');

            this.map = L.map('map', {
                center: new L.LatLng(56.7050482, -111.4407939),
                zoom: 12
            });

            this.map.addLayer(this.basemap);
        }

        public update(options: VisualUpdateOptions) {
            console.log('update called');
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
